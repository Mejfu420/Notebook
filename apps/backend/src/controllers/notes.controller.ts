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
        console.log(error);
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
        console.error("Prisma Create Error:", error);
        res.status(500).json({ error: "Error creating note" });
    }
};

export const updateNote = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const { title, content } = req.body;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid note ID format" });
    }

    try {
        const note = await prisma.note.findUnique({
            where: { id }
        });

        if (!note || note.userId !== userId) {
            return res.status(404).json({ error: "Note not found" });
        }

        const updatedNote = await prisma.note.update({
            where: { id },
            data: { title, content }
        });

        res.json(updatedNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating note" });
    }
};

export const deleteNote = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid note ID format" });
    }

    try {
        const note = await prisma.note.findUnique({
            where: { id }
        });

        if (!note || note.userId !== userId) {
            return res.status(404).json({ error: "Note not found" });
        }

        await prisma.note.delete({
            where: { id }
        });

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting note" });
    }
};

export const getNote = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid note ID format" });
    }

    try {
        const note = await prisma.note.findUnique({
            where: { id }
        });

        if (!note || note.userId !== userId) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching note" });
    }
};