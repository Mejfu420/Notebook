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
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

            const mockNotes = [{ id: 'note_1', title: 'My Note', content: 'Hello World', userId: 'user_123' }];
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

    describe('GET /api/notes/:id', () => {
        it('should fetch a single note successfully when authenticated', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'My Note', content: 'Hello World', userId: 'user_123' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            const response = await request(app).get('/api/notes/note_123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNote);
            expect(prisma.note.findUnique).toHaveBeenCalledWith({ where: { id: 'note_123' } });
        });

        it('should return 404 if the note does not exist', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            const response = await request(app).get('/api/notes/note_999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 404 if the note belongs to a different user', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_different' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            const response = await request(app).get('/api/notes/note_123');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 500 if there is a database error', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/notes/note_123');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error fetching note' });
        });
    });

    describe('POST /api/notes', () => {
        it('should create a new note successfully', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockCreatedNote = { id: 'note_2', title: 'New Note', content: 'Test Content', userId: 'user_123' };
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

    describe('PUT /api/notes/:id', () => {
        it('should update an existing note successfully', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'Old Title', content: 'Old Content', userId: 'user_123' };
            const mockUpdatedNote = { id: 'note_123', title: 'Updated Title', content: 'Updated Content', userId: 'user_123' };

            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);
            jest.mocked(prisma.note.update).mockResolvedValue(mockUpdatedNote as any);

            const response = await request(app)
                .put('/api/notes/note_123')
                .send({ title: 'Updated Title', content: 'Updated Content' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUpdatedNote);
            expect(prisma.note.findUnique).toHaveBeenCalledWith({ where: { id: 'note_123' } });
            expect(prisma.note.update).toHaveBeenCalledWith({
                where: { id: 'note_123' },
                data: { title: 'Updated Title', content: 'Updated Content' }
            });
        });

        it('should return 404 if the note does not exist', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            const response = await request(app)
                .put('/api/notes/note_999')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 404 if the note belongs to a different user', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_different' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            const response = await request(app)
                .put('/api/notes/note_123')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 500 if there is a database error during update', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/notes/note_123')
                .send({ title: 'Title', content: 'Content' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error updating note' });
        });
    });

    describe('DELETE /api/notes/:id', () => {
        it('should delete a note successfully', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_123' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);
            jest.mocked(prisma.note.delete).mockResolvedValue(mockNote as any);

            const response = await request(app).delete('/api/notes/note_123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Note deleted successfully' });
            expect(prisma.note.findUnique).toHaveBeenCalledWith({ where: { id: 'note_123' } });
            expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 'note_123' } });
        });

        it('should return 404 if the note does not exist for deletion', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            const response = await request(app).delete('/api/notes/note_999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 404 if the note to delete belongs to a different user', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);

            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_different' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            const response = await request(app).delete('/api/notes/note_123');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Note not found' });
        });

        it('should return 500 if there is a database error during deletion', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/notes/note_123');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Error deleting note' });
        });
    });
});