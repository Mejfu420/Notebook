import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// endpoints

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

export default app;