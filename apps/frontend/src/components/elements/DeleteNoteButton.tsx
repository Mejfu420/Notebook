"use client";

import { useRouter } from "next/navigation";
import { deleteNote } from "@/libs/api";
import styles from "@/styles/notes.module.scss";

interface DeleteNoteButtonProps {
    noteId: string;
    token: string | null;
}

export default function DeleteNoteButton({ noteId, token }: DeleteNoteButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        const success = await deleteNote(token, noteId);
        if (success) {
            router.refresh();
        }
    };

    return (
        <button className={styles.deleteButton} title="Delete note" onClick={handleDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
        </button>
    );
}