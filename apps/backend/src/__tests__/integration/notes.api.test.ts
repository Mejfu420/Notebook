/// <reference types="jest" />
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../libs/prisma';
import { getAuth } from '@clerk/express';

jest.mock('../../libs/prisma', () => ({
    prisma: {
        note: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock('@clerk/express', () => ({
    clerkMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
    getAuth: jest.fn(),
}));

describe('Notes API & Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/health', () => {
        it('should return 200 OK for health check', async () => {
            const response = await request(app).get('/api/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'OK' });
        });
    });

    describe('GET /api/notes', () => {
        it('should return 401 Unauthorized if user is not logged in', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: null } as any);

            const response = await request(app).get('/api/notes');
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ error: 'Unauthorized' });
        });

        it('should fetch notes successfully when authenticated', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNotes = [{ id: 1, title: 'My Note', content: 'Hello World', userId: 'user_123' }];
            jest.mocked(prisma.note.findMany).mockResolvedValue(mockNotes as any);

            const response = await request(app).get('/api/notes');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotes);
            expect(prisma.note.findMany).toHaveBeenCalledWith({ where: { userId: 'user_123' } });
        });

        it('should return 500 if there is a database error while fetching notes', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findMany).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/notes');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error fetching notes' });
        });
    });

    describe('POST /api/notes', () => {
        it('should create a new note successfully', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockCreatedNote = { id: 2, title: 'New Note', content: 'Test Content', userId: 'user_123' };
            jest.mocked(prisma.note.create).mockResolvedValue(mockCreatedNote as any);

            const response = await request(app)
                .post('/api/notes')
                .send({ title: 'New Note', content: 'Test Content' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockCreatedNote);
            expect(prisma.note.create).toHaveBeenCalledWith({
                data: { title: 'New Note', content: 'Test Content', userId: 'user_123' }
            });
        });

        it('should return 500 if there is a database error while creating a note', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.create).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/notes')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error creating note' });
        });
    });
});