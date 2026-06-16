"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

    const handleSave = async () => {
        setIsEditing(false);
    };

    const handleDelete = async () => {
        router.push("/notes");
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                                <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>
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
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
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