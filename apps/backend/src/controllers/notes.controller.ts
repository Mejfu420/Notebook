import 'dotenv/config';
import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../libs/prisma';

export const getNotes = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    try {
        const notes = await prisma.note.findMany({
            where: { userId: userId! }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Error fetching notes" });
    }
};

export const createNote = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { title, content } = req.body;

    try {
        const newNote = await prisma.note.create({
            data: { title, content, userId: userId! }
        });
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ error: "Error creating note" });
    }
};