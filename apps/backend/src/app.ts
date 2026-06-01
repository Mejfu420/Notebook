import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import webhookRoutes from './routes/webhook.routes';

const app = express();

app.use(cors());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/notes', require('./routes/notes.routes').default);

export default app;