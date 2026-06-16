import { currentUser, auth } from '@clerk/nextjs/server'
import { fetchUserNotes } from '@/libs/api'
import Link from 'next/link'
import NewNoteButton from '@/components/elements/NewNoteButton'
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
                            <button className={styles.deleteButton} title="Delete note">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}