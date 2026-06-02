const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Note {
    id: string | number;
    title: string;
    content: string;
    userId: string;
}

const getHeaders = (token: string | null) => {
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export async function fetchUserNotes(token: string | null): Promise<Note[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notes`, {
            method: 'GET',
            headers: getHeaders(token),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [fetchUserNotes]:', error);
        return [];
    }
}

export async function createNote(
    token: string | null,
    title: string,
    content: string
): Promise<Note | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notes`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [createNote]:', error);
        return null;
    }
}