/// <reference types="jest" />
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../controllers/announcements.controller';
import { prisma } from '../../../libs/prisma';
import { getAuth } from '@clerk/express';

jest.mock('../../../libs/prisma', () => ({
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
    getAuth: jest.fn(),
}));

describe('Announcements Controller (Unit)', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('getAnnouncements', () => {
        it('should return announcements ordered by createdAt descending', async () => {
            const mockAnnouncements = [{ id: 'ann_1', title: 'Title', content: 'Content' }];
            jest.mocked(prisma.announcement.findMany).mockResolvedValue(mockAnnouncements as any);

            await getAnnouncements(req, res);

            expect(prisma.announcement.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' }
            });
            expect(res.json).toHaveBeenCalledWith(mockAnnouncements);
        });

        it('should return 500 on database error', async () => {
            jest.mocked(prisma.announcement.findMany).mockRejectedValue(new Error('DB Error'));

            await getAnnouncements(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching announcements' });
        });
    });

    describe('createAnnouncement', () => {
        it('should return 401 if user is not authenticated', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

            await createAnnouncement(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });

        it('should return 403 if user is not an admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_123', role: 'user' } as any);

            await createAnnouncement(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Admins only' });
        });

        it('should create announcement and return 201 if user is admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            req.body = { title: 'Global News', content: 'Content News' };
            const mockCreated = { id: 'ann_2', title: 'Global News', content: 'Content News' };
            jest.mocked(prisma.announcement.create).mockResolvedValue(mockCreated as any);

            await createAnnouncement(req, res);

            expect(prisma.announcement.create).toHaveBeenCalledWith({
                data: { title: 'Global News', content: 'Content News' }
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCreated);
        });
    });

    describe('updateAnnouncement', () => {
        it('should return 400 if ID format is invalid', async () => {
            req.params.id = undefined;

            await updateAnnouncement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid announcement ID format' });
        });

        it('should return 403 if authenticated user is not admin during update', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'ann_123';
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_123', role: 'user' } as any);

            await updateAnnouncement(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Admins only' });
        });

        it('should update announcement successfully if user is admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            req.params.id = 'ann_123';
            req.body = { title: 'Updated Title', content: 'Updated Content' };
            
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            const mockUpdated = { id: 'ann_123', title: 'Updated Title', content: 'Updated Content' };
            jest.mocked(prisma.announcement.update).mockResolvedValue(mockUpdated as any);

            await updateAnnouncement(req, res);

            expect(prisma.announcement.update).toHaveBeenCalledWith({
                where: { id: 'ann_123' },
                data: { title: 'Updated Title', content: 'Updated Content' }
            });
            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });
    });

    describe('deleteAnnouncement', () => {
        it('should return 400 if ID format is invalid', async () => {
            req.params.id = undefined;

            await deleteAnnouncement(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid announcement ID format' });
        });

        it('should delete announcement successfully if user is admin', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'admin_123' } as any);
            req.params.id = 'ann_123';
            
            jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'admin_123', role: 'admin' } as any);
            jest.mocked(prisma.announcement.delete).mockResolvedValue({ id: 'ann_123' } as any);

            await deleteAnnouncement(req, res);

            expect(prisma.announcement.delete).toHaveBeenCalledWith({ where: { id: 'ann_123' } });
            expect(res.json).toHaveBeenCalledWith({ message: 'Announcement deleted successfully' });
        });
    });
});