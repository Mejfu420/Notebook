"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateNote, deleteNote, fetchNote } from "@/libs/api";
import styles from "@/styles/noteDetail.module.scss";

interface NoteEditorProps {
    noteId: string;
    token: string | null;
    initialNote: {
        id: string;
        title: string;
        content: string;
    };
}

export default function NoteEditor({ noteId, token, initialNote }: NoteEditorProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialNote.title);
    const [content, setContent] = useState(initialNote.content);
    const [draftTitle, setDraftTitle] = useState(initialNote.title);
    const [draftContent, setDraftContent] = useState(initialNote.content);

    useEffect(() => {
        async function loadFreshNote() {
            const freshNote = await fetchNote(token, noteId);
            if (freshNote) {
                setTitle(freshNote.title);
                setContent(freshNote.content);
                if (!isEditing) {
                    setDraftTitle(freshNote.title);
                    setDraftContent(freshNote.content);
                }
            }
        }
        loadFreshNote();
    }, [noteId, token, isEditing]);

    const handleStartEdit = () => {
        setDraftTitle(title);
        setDraftContent(content);
        setIsEditing(true);
    };

    const handleSave = async () => {
        const updated = await updateNote(token, noteId, draftTitle, draftContent);
        if (updated) {
            setTitle(updated.title);
            setContent(updated.content);
            setIsEditing(false);
            router.refresh();
        }
    };

    const handleDelete = async () => {
        const success = await deleteNote(token, noteId);
        if (success) {
            router.push("/notes");
            router.refresh();
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.backNav}>
                <Link href="/notes" className={styles.backLink}>
                    &larr; Back to notes
                </Link>
            </div>

            <div className={styles.noteWindow}>
                <div className={styles.header}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className={styles.titleInput}
                        />
                    ) : (
                        <h1 className={styles.title}>{title || "Untitled Note"}</h1>
                    )}

                    <div className={styles.actions}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className={styles.btnSave}>
                                    Save Changes
                                </button>
                                <button onClick={() => setIsEditing(false)} className={styles.btnCancel}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleStartEdit} className={styles.btnEdit}>
                                    Edit Note
                                </button>
                                <button onClick={handleDelete} className={styles.btnDelete}>
                                    Delete Note
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.contentArea}>
                    {isEditing ? (
                        <textarea
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            className={styles.contentTextarea}
                        />
                    ) : (
                        <p className={styles.content}>{content || "No content..."}</p>
                    )}
                </div>
            </div>
        </main>
    );
}