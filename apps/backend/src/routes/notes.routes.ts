import { Router } from 'express';
import { getNotes, createNote } from '../controllers/notes.controller';
import { clerkMiddleware } from '@clerk/express';
import { requireApiAuth } from '../middlewares/requireAuth';

const router = Router();

router.use(clerkMiddleware(), requireApiAuth);

router.get('/', getNotes);
router.post('/', createNote);

export default router;