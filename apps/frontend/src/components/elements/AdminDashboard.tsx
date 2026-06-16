"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, Announcement } from '@/libs/api';
import styles from '@/styles/admin.module.scss';

interface AdminDashboardProps {
    token: string | null;
    initialAnnouncements: Announcement[];
}

export default function AdminDashboard({ token, initialAnnouncements }: AdminDashboardProps) {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartCreate = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setIsFormOpen(true);
    };

    const handleStartEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setTitle(announcement.title);
        setContent(announcement.content);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setTitle('');
        setContent('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingId) {
            const updated = await updateAnnouncement(token, editingId, title, content);
            if (updated) {
                setAnnouncements(prev => prev.map(a => a.id === editingId ? updated : a));
                setIsFormOpen(false);
                setEditingId(null);
                setTitle('');
                setContent('');
                router.refresh();
            }
        } else {
            const created = await createAnnouncement(token, title, content);
            if (created) {
                setAnnouncements(prev => [created, ...prev]);
                setIsFormOpen(false);
                setTitle('');
                setContent('');
                router.refresh();
            }
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const success = await deleteAnnouncement(token, id);
        if (success) {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            router.refresh();
        }
    };

    return (
        <main className={styles.adminContainer}>
            <div className={styles.dashboardWindow}>
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.title}>Admin Panel</h1>
                        <p className={styles.subtitle}>Manage global announcements</p>
                    </div>
                    {!isFormOpen && (
                        <button onClick={handleStartCreate} className={styles.btnCreate}>
                            New Announcement
                        </button>
                    )}
                </div>

                {isFormOpen && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
                        <div className={styles.inputGroup}>
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="content">Content</label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" disabled={loading} className={styles.btnSubmit}>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" onClick={handleCancel} className={styles.btnCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className={styles.listSection}>
                    {announcements.length === 0 ? (
                        <p className={styles.emptyState}>No announcements found.</p>
                    ) : (
                        <div className={styles.grid}>
                            {announcements.map((item) => (
                                <div key={item.id} className={styles.card}>
                                    <div className={styles.cardContent}>
                                        <h3>{item.title}</h3>
                                        <p>{item.content}</p>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => handleStartEdit(item)} className={styles.btnEdit} title="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className={styles.btnDelete} title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}