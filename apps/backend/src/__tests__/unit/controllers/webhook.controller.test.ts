/// <reference types="jest" />
import { clerkWebhookHandler } from '../../../controllers/webhook.controller';
import { prisma } from '../../../libs/prisma';

jest.mock('../../../libs/prisma', () => ({
    prisma: {
        user: {
            upsert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('svix', () => {
    return {
        Webhook: jest.fn().mockImplementation(() => {
            return {
                verify: jest.fn((payload, headers) => {
                    if (headers['svix-signature'] === 'invalid-signature') {
                        throw new Error('Verification failed');
                    }
                    return JSON.parse(payload);
                }),
            };
        }),
    };
});

describe('Webhook Controller (Unit)', () => {
    let req: any;
    let res: any;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, CLERK_WEBHOOK_SECRET: 'whsec_secret123' };
        req = {
            headers: {
                'svix-id': 'msg_123',
                'svix-timestamp': '123456',
                'svix-signature': 'valid-signature',
            },
            body: Buffer.from(JSON.stringify({ type: 'user.created', data: { id: 'user_1', email_addresses: [{ email_address: 'u@test.com' }] } })),
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return 500 if CLERK_WEBHOOK_SECRET is missing', async () => {
        delete process.env.CLERK_WEBHOOK_SECRET;

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing CLERK_WEBHOOK_SECRET in .env file' });
    });

    it('should return 400 if svix headers are missing', async () => {
        req.headers = {};

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing Svix headers' });
    });

    it('should return 400 if signature verification fails', async () => {
        req.headers['svix-signature'] = 'invalid-signature';

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Verification failed' });
    });

    it('should upsert a user and return 201 on valid user.created event', async () => {
        jest.mocked(prisma.user.upsert).mockResolvedValue({ id: 'user_1', email: 'u@test.com', role: 'user' } as any);

        await clerkWebhookHandler(req, res);

        expect(prisma.user.upsert).toHaveBeenCalledWith({
            where: { id: 'user_1' },
            update: { email: 'u@test.com', role: 'user' },
            create: { id: 'user_1', email: 'u@test.com', role: 'user' },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User created or updated in database' });
    });

    it('should update user role and return 200 on valid user.updated event', async () => {
        req.body = Buffer.from(JSON.stringify({
            type: 'user.updated',
            data: { id: 'user_1', public_metadata: { role: 'admin' } }
        }));

        await clerkWebhookHandler(req, res);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user_1' },
            data: { role: 'admin' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User role updated in database' });
    });

    it('should delete user and return 200 on valid user.deleted event', async () => {
        req.body = Buffer.from(JSON.stringify({
            type: 'user.deleted',
            data: { id: 'user_1' }
        }));

        await clerkWebhookHandler(req, res);

        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: 'user_1' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User deleted from database' });
    });

    it('should handle P2025 error on user.deleted gracefully', async () => {
        req.body = Buffer.from(JSON.stringify({ type: 'user.deleted', data: { id: 'user_1' } }));
        jest.mocked(prisma.user.delete).mockRejectedValue({ code: 'P2025' });

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User already gone' });
    });

    it('should return 500 if prisma database operation fails', async () => {
        jest.mocked(prisma.user.upsert).mockRejectedValue(new Error('Prisma Error'));

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error updating database' });
    });

    it('should return 200 for completely unhandled event types', async () => {
        req.body = Buffer.from(JSON.stringify({ type: 'organization.created', data: { id: 'org_1' } }));

        await clerkWebhookHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ received: true, message: 'Event unhandled but acknowledged' });
    });

    it('should return 400 if email is missing in user.created event', async () => {
        req.body = Buffer.from(JSON.stringify({
            type: 'user.created',
            data: { id: 'user_1', email_addresses: [] }
        }));
        await clerkWebhookHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing email address in event data' });
    });

    it('should return 500 on database error other than P2025 in user.deleted', async () => {
        req.body = Buffer.from(JSON.stringify({
            type: 'user.deleted',
            data: { id: 'user_1' }
        }));
        jest.mocked(prisma.user.delete).mockRejectedValue(new Error('Some other DB error'));
        await clerkWebhookHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error updating database' });
    });

    it('should update user role to default "user" if role not provided in user.updated', async () => {
        req.body = Buffer.from(JSON.stringify({
            type: 'user.updated',
            data: { id: 'user_1', public_metadata: {} }
        }));

        await clerkWebhookHandler(req, res);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user_1' },
            data: { role: 'user' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User role updated in database' });
    });
});