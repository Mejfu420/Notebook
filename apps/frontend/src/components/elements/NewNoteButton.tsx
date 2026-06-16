"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createNote } from "@/libs/api";

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
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
            {isLoading ? "Creating..." : "New Note"}
        </button>
    );
}