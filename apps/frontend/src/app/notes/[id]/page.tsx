import { auth } from '@clerk/nextjs/server'
import NoteEditor from '@/components/elements/NoteEditor'

interface Props {
    params: Promise<{ id: string }>
}

export default async function NoteDetailPage({ params }: Props) {
    const { id } = await params
    const { getToken } = await auth()
    const token = await getToken()

    const initialNote = {
        id,
        title: "Fetched Note Title",
        content: "Fetched Note Content"
    }

    return (
        <NoteEditor 
            noteId={id} 
            token={token} 
            initialNote={initialNote} 
        />
    )
}