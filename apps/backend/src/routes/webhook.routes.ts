import { Router, Request, Response } from 'express';
import express from 'express';
import { Webhook } from 'svix';
import { prisma } from '../libs/prisma';

const router = Router();

router.post('/clerk', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ error: 'Missing CLERK_WEBHOOK_SECRET in .env file' });
    }

    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Missing Svix headers' });
    }

    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        return res.status(400).json({ error: 'Verification failed' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const primaryEmail = evt.data.email_addresses[0]?.email_address;

        try {
            await prisma.user.create({
                data: {
                    id: id,
                    email: primaryEmail,
                },
            });
            return res.status(201).json({ success: true, message: 'User created in database' });
        } catch (error) {
            return res.status(500).json({ error: 'Error saving user to database' });
        }
    }

    res.status(200).json({ received: true });
});

export default router;