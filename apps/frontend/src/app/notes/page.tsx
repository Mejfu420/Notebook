import { currentUser, auth } from '@clerk/nextjs/server'
import { fetchUserNotes } from '@/libs/api'
import Link from 'next/link'
import NewNoteButton from '@/components/elements/NewNoteButton'
import DeleteNoteButton from '@/components/elements/DeleteNoteButton'
import styles from '@/styles/notes.module.scss'

export default async function NotesPage() {
    const user = await currentUser()
    const { getToken } = await auth()

    const token = await getToken()
    const notes = await fetchUserNotes(token)

    return (
        <main className={styles.notesContainer}>
            {notes.length > 0 && (
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.title}>Welcome, {user?.firstName || 'user'}!</h1>
                    </div>
                    <NewNoteButton />
                </div>
            )}

            {notes.length === 0 ? (
                <div className={styles.emptyState}>
                    <h2>No notes found</h2>
                    <NewNoteButton />
                </div>
            ) : (
                <div className={styles.notesList}>
                    {notes.map((note) => (
                        <div key={note.id} className={styles.noteCardWrapper}>
                            <Link href={`/notes/${note.id}`} className={styles.noteCard}>
                                <h3>{note.title || 'Untitled Note'}</h3>
                                <p>{note.content || 'No content...'}</p>
                            </Link>
                            <DeleteNoteButton noteId={note.id} token={token} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}