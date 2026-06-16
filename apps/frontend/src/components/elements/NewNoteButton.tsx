"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createNote } from "@/libs/api";
import styles from "@/styles/NewNoteButton.module.scss";

export default function NewNoteButton() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            const newNote = await createNote(token, "Untitled Note", "");

            if (newNote?.id) {
                router.push(`/notes/${newNote.id}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCreate}
            disabled={isLoading}
            className={styles.newNoteBtn}
        >
            {isLoading ? "Creating..." : "New Note"}
        </button>
    );
}