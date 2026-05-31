/// <reference types="jest" />
import { getNotes, createNote } from '../../../controllers/notes.controller';
import { prisma } from '../../../libs/prisma';
import { getAuth } from '@clerk/express';

jest.mock('../../../libs/prisma', () => ({
    prisma: {
        note: {
            findMany: jest.fn(),
            create: jest.fn(),
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
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    describe('getNotes', () => {
        it('should return notes with 200 on success', async () => {
            jest.mocked(getAuth).mockReturnValue({ userId: 'user_123' } as any);
            const mockNotes = [{ id: 1, title: 'Note 1', content: 'Content 1', userId: 'user_123' }];
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
            const mockNewNote = { id: 2, title: 'New Note', content: 'New Content', userId: 'user_123' };
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
});