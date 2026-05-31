import { Router } from 'express';
import express from 'express';
import { clerkWebhookHandler } from '../controllers/webhook.controller';

const router = Router();

router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);

export default router;