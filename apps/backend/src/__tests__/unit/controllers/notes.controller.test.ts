/// <reference types="jest" />
import { getNotes, createNote, updateNote, deleteNote, getNote } from '../../../controllers/notes.controller';
import { prisma } from '../../../libs/prisma';
import { getAuth } from '@clerk/express';

jest.mock('../../../libs/prisma', () => ({
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
    getAuth: jest.fn(),
}));

describe('Notes Controller (Unit)', () => {
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

    describe('getNotes', () => {
        it('should return notes with 200 on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            const mockNotes = [{ id: 'note_1', title: 'Note 1', content: 'Content 1', userId: 'user_123' }];
            jest.mocked(prisma.note.findMany).mockResolvedValue(mockNotes as any);

            await getNotes(req, res);

            expect(prisma.note.findMany).toHaveBeenCalledWith({ where: { userId: 'user_123' } });
            expect(res.json).toHaveBeenCalledWith(mockNotes);
        });

        it('should return 500 if prisma fetching throws an error', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            jest.mocked(prisma.note.findMany).mockRejectedValue(new Error('DB Error'));

            await getNotes(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching notes' });
        });
    });

    describe('createNote', () => {
        it('should create a note and return 201 on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.body = { title: 'New Note', content: 'New Content' };
            const mockNewNote = { id: 'note_2', title: 'New Note', content: 'New Content', userId: 'user_123' };
            jest.mocked(prisma.note.create).mockResolvedValue(mockNewNote as any);

            await createNote(req, res);

            expect(prisma.note.create).toHaveBeenCalledWith({
                data: { title: 'New Note', content: 'New Content', userId: 'user_123' },
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewNote);
        });

        it('should return 500 if prisma creation throws an error', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.body = { title: 'Fail', content: 'Fail' };
            jest.mocked(prisma.note.create).mockRejectedValue(new Error('DB Error'));

            await createNote(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error creating note' });
        });
    });

    describe('updateNote', () => {
        it('should return 400 if id parameter is missing or invalid', async () => {
            req.params.id = undefined;

            await updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid note ID format' });
        });

        it('should return 404 if note does not exist', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_999';
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            await updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
        });

        it('should return 404 if note belongs to a different user', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'different_user' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            await updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
        });

        it('should update note and return 200 on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            req.body = { title: 'Updated Title', content: 'Updated Content' };

            const mockNote = { id: 'note_123', title: 'Old Title', content: 'Old Content', userId: 'user_123' };
            const mockUpdatedNote = { id: 'note_123', title: 'Updated Title', content: 'Updated Content', userId: 'user_123' };

            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);
            jest.mocked(prisma.note.update).mockResolvedValue(mockUpdatedNote as any);

            await updateNote(req, res);

            expect(prisma.note.update).toHaveBeenCalledWith({
                where: { id: 'note_123' },
                data: { title: 'Updated Title', content: 'Updated Content' }
            });
            expect(res.json).toHaveBeenCalledWith(mockUpdatedNote);
        });

        it('should return 500 if database error occurs during update', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('DB Error'));

            await updateNote(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error updating note' });
        });
    });

    describe('deleteNote', () => {
        it('should return 400 if id parameter is invalid', async () => {
            req.params.id = undefined;

            await deleteNote(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid note ID format' });
        });

        it('should return 404 if note to delete does not exist', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_999';
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            await deleteNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
        });

        it('should delete note and return success message on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_123' };

            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);
            jest.mocked(prisma.note.delete).mockResolvedValue(mockNote as any);

            await deleteNote(req, res);

            expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 'note_123' } });
            expect(res.json).toHaveBeenCalledWith({ message: 'Note deleted successfully' });
        });

        it('should return 500 if database error occurs during deletion', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('DB Error'));

            await deleteNote(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting note' });
        });
    });

    describe('getNote', () => {
        it('should return 400 if id parameter is invalid', async () => {
            req.params.id = undefined;

            await getNote(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid note ID format' });
        });

        it('should return 404 if note does not exist', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_999';
            jest.mocked(prisma.note.findUnique).mockResolvedValue(null);

            await getNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
        });

        it('should return 404 if note belongs to a different user', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'different_user' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            await getNote(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
        });

        it('should return 200 and the note on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            const mockNote = { id: 'note_123', title: 'Title', content: 'Content', userId: 'user_123' };
            jest.mocked(prisma.note.findUnique).mockResolvedValue(mockNote as any);

            await getNote(req, res);

            expect(prisma.note.findUnique).toHaveBeenCalledWith({ where: { id: 'note_123' } });
            expect(res.json).toHaveBeenCalledWith(mockNote);
        });

        it('should return 500 if database error occurs', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            req.params.id = 'note_123';
            jest.mocked(prisma.note.findUnique).mockRejectedValue(new Error('DB Error'));

            await getNote(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching note' });
        });
    });
});