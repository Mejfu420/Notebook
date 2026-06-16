import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../libs/prisma';

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching announcements" });
    }
};

export const createAnnouncement = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { title, content } = req.body;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        const newAnnouncement = await prisma.announcement.create({
            data: { title, content }
        });

        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating announcement" });
    }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const { title, content } = req.body;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        const updatedAnnouncement = await prisma.announcement.update({
            where: { id },
            data: { title, content }
        });

        res.json(updatedAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating announcement" });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid announcement ID format" });
    }

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        await prisma.announcement.delete({
            where: { id }
        });

        res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting announcement" });
    }
};