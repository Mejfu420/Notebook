const API_BASE_URL = typeof window === 'undefined'
    ? (process.env.INTERNAL_BACKEND_URL || 'http://backend-service')
    : (process.env.API_URL || 'https://mejfu.dev');

export interface Note {
    id: string;
    title: string;
    content: string;
    userId: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt?: string;
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

export async function fetchNote(token: string | null, id: string): Promise<Note | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
            method: 'GET',
            headers: getHeaders(token),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [fetchNote]:', error);
        return null;
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

export async function updateNote(
    token: string | null,
    id: string,
    title: string,
    content: string
): Promise<Note | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
            method: 'PUT',
            headers: getHeaders(token),
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [updateNote]:', error);
        return null;
    }
}

export async function deleteNote(token: string | null, id: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error [deleteNote]:', error);
        return false;
    }
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
            method: 'GET',
            headers: getHeaders(null),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [fetchAnnouncements]:', error);
        return [];
    }
}

export async function createAnnouncement(
    token: string | null,
    title: string,
    content: string
): Promise<Announcement | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [createAnnouncement]:', error);
        return null;
    }
}

export async function updateAnnouncement(
    token: string | null,
    id: string,
    title: string,
    content: string
): Promise<Announcement | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
            method: 'PUT',
            headers: getHeaders(token),
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error [updateAnnouncement]:', error);
        return null;
    }
}

export async function deleteAnnouncement(token: string | null, id: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });

        if (!response.ok) {
            throw new Error(`Backend returned error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error [deleteAnnouncement]:', error);
        return false;
    }
}