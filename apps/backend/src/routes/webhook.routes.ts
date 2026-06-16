import { Router } from 'express';
import express from 'express';
import { clerkWebhookHandler } from '../controllers/webhook.controller';

const router = Router();

router.post(
    '/clerk', 
    express.raw({ type: () => true }), 
    clerkWebhookHandler
);

export default router;