import { Router } from 'express';
import { getNotes, createNote, deleteNote, updateNote, getNote } from '../controllers/notes.controller';
import { clerkMiddleware } from '@clerk/express';
import { requireApiAuth } from '../middlewares/requireAuth';

const router = Router();

router.use(clerkMiddleware(), requireApiAuth);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.get('/:id', getNote);

export default router;