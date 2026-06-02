import { currentUser, auth } from '@clerk/nextjs/server'
import { fetchUserNotes } from '@/libs/api'
import styles from '@/styles/notes.module.scss'

export default async function NotesPage() {
    const user = await currentUser()
    const { getToken } = await auth()

    const token = await getToken()
    const notes = await fetchUserNotes(token)

    return (
        <main className={styles.notesContainer}>
            <h1 className={styles.title}>Welcome, {user?.firstName || 'user'}!</h1>
            <p className={styles.subtitle}>Here are your secret notes.</p>

            <div className={styles.notesList}>
                {notes.length === 0 ? (
                    <p className={styles.noNotes}>No notes to display. Add your first note!</p>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className={styles.noteCard}>
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                        </div>
                    ))
                )}
            </div>
        </main>
    )
}