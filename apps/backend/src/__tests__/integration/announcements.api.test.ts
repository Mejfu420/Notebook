/// <reference types="jest" />
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../libs/prisma';
import { getAuth } from '@clerk/express';

jest.mock('../../libs/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        announcement: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('@clerk/express', () => ({
    clerkMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
    getAuth: jest.fn(),
}));

describe('Announcements API & RBAC Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/announcements', () => {
        it('should fetch announcements successfully', async () => {
            const mockAnnouncements = [
                { id: 'ann_1', title: 'System Maintenance', content: 'Server will be down for 1 hour', createdAt: new Date().toISOString() }
            ];
            jest.mocked(prisma.announcement.findMany).mockResolvedValue(mockAnnouncements as any);

            const response = await request(app).get('/api/announcements');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAnnouncements);
            expect(prisma.announcement.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' }
            });
        });

        it('should return 500 if there is a database error while fetching', async () => {
            jest.mocked(prisma.announcement.findMany).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/announcements');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error fetching announcements' });
        });
    });

    describe('POST /api/announcements', () => {
        it('should return 401 if user is not logged in', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

            const response = await request(app)
                .post('/api/announcements')
                .send({ title: 'New Event', content: 'Details here' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Unauthorized' });
        });

        it('should return 403 if user is not an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_123', role: 'user' } as any);

            const response = await request(app)
                .post('/api/announcements')
                .send({ title: 'New Event', content: 'Details here' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Forbidden: Admins only' });
        });

        it('should create an announcement successfully if user is an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            
            const mockAnnouncement = { id: 'ann_2', title: 'New Event', content: 'Details here' };
            jest.mocked(prisma.announcement.create).mockResolvedValue(mockAnnouncement as any);

            const response = await request(app)
                .post('/api/announcements')
                .send({ title: 'New Event', content: 'Details here' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockAnnouncement);
            expect(prisma.announcement.create).toHaveBeenCalledWith({
                data: { title: 'New Event', content: 'Details here' }
            });
        });

        it('should return 500 if there is a database error during creation', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            jest.mocked(prisma.announcement.create).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/announcements')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error creating announcement' });
        });
    });

    describe('PUT /api/announcements/:id', () => {
        it('should return 401 if user is not logged in', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

            const response = await request(app)
                .put('/api/announcements/ann_123')
                .send({ title: 'Updated Title', content: 'Updated Content' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Unauthorized' });
        });

        it('should return 403 if user is not an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_123', role: 'user' } as any);

            const response = await request(app)
                .put('/api/announcements/ann_123')
                .send({ title: 'Updated Title', content: 'Updated Content' });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Forbidden: Admins only' });
        });

        it('should update an announcement successfully if user is an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            
            const mockUpdatedAnnouncement = { id: 'ann_123', title: 'Updated Title', content: 'Updated Content' };
            jest.mocked(prisma.announcement.update).mockResolvedValue(mockUpdatedAnnouncement as any);

            const response = await request(app)
                .put('/api/announcements/ann_123')
                .send({ title: 'Updated Title', content: 'Updated Content' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUpdatedAnnouncement);
            expect(prisma.announcement.update).toHaveBeenCalledWith({
                where: { id: 'ann_123' },
                data: { title: 'Updated Title', content: 'Updated Content' }
            });
        });

        it('should return 500 if there is a database error during update', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            jest.mocked(prisma.announcement.update).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/announcements/ann_123')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error updating announcement' });
        });
    });

    describe('DELETE /api/announcements/:id', () => {
        it('should return 401 if user is not logged in', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

            const response = await request(app).delete('/api/announcements/ann_123');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Unauthorized' });
        });

        it('should return 403 if user is not an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_123', role: 'user' } as any);

            const response = await request(app).delete('/api/announcements/ann_123');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Forbidden: Admins only' });
        });

        it('should delete an announcement successfully if user is an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            jest.mocked(prisma.announcement.delete).mockResolvedValue({ id: 'ann_123' } as any);

            const response = await request(app).delete('/api/announcements/ann_123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Announcement deleted successfully' });
            expect(prisma.announcement.delete).toHaveBeenCalledWith({
                where: { id: 'ann_123' }
            });
        });

        it('should return 500 if there is a database error during deletion', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            jest.mocked(prisma.announcement.delete).mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/announcements/ann_123');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error deleting announcement' });
        });
    });
});