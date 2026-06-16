/// <reference types="jest" />
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../libs/prisma';

jest.mock('../../libs/prisma', () => ({
    prisma: {
        user: {
            create: jest.fn(),
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
                        throw new Error('Invalid signature');
                    }
                    return JSON.parse(payload);
                }),
            };
        }),
    };
});

describe('Webhook API Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, CLERK_WEBHOOK_SECRET: 'whsec_testsecret12345' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('POST /api/webhooks/clerk', () => {
        it('should return 500 if CLERK_WEBHOOK_SECRET is missing', async () => {
            delete process.env.CLERK_WEBHOOK_SECRET;

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .send({ type: 'user.created' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Missing CLERK_WEBHOOK_SECRET in .env file' });
        });

        it('should return 400 if Svix headers are missing', async () => {
            const response = await request(app)
                .post('/api/webhooks/clerk')
                .send({ type: 'user.created' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Missing Svix headers' });
        });

        it('should return 400 if verification fails (invalid signature)', async () => {
            const mockPayload = { type: 'user.created', data: { id: 'user_123' } };

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_123')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'invalid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Verification failed' });
        });

        it('should create a user with default role and return 201 on valid user.created event', async () => {
            const mockPayload = {
                type: 'user.created',
                data: { id: 'user_clerk_999', email_addresses: [{ email_address: 'mejfu@example.com' }] },
            };

            jest.mocked(prisma.user.create).mockResolvedValue({ id: 'user_clerk_999', email: 'mejfu@example.com', role: 'user' } as any);

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_valid')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'valid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ success: true, message: 'User created in database' });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: { id: 'user_clerk_999', email: 'mejfu@example.com', role: 'user' },
            });
        });

        it('should update user role and return 200 on valid user.updated event', async () => {
            const mockPayload = {
                type: 'user.updated',
                data: { id: 'user_clerk_999', public_metadata: { role: 'admin' } },
            };

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_valid')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'valid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true, message: 'User role updated in database' });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user_clerk_999' },
                data: { role: 'admin' },
            });
        });

        it('should delete user and return 200 on valid user.deleted event', async () => {
            const mockPayload = {
                type: 'user.deleted',
                data: { id: 'user_clerk_999' },
            };

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_valid')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'valid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ success: true, message: 'User deleted from database' });
            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: 'user_clerk_999' },
            });
        });

        it('should return 500 if database operation fails', async () => {
            const mockPayload = {
                type: 'user.created',
                data: { id: 'user_fail', email_addresses: [{ email_address: 'fail@example.com' }] },
            };

            jest.mocked(prisma.user.create).mockRejectedValue(new Error('Database offline'));

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_fail')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'valid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error updating database' });
        });

        it('should return 200 with generic message for other unhandled valid webhook events', async () => {
            const mockPayload = {
                type: 'session.created',
                data: { id: 'sess_123' },
            };

            const response = await request(app)
                .post('/api/webhooks/clerk')
                .set('svix-id', 'msg_other')
                .set('svix-timestamp', '1234567890')
                .set('svix-signature', 'valid-signature')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(mockPayload));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ received: true, message: 'Event unhandled but acknowledged' });
        });
    });
});