'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAnnouncements, Announcement } from '@/libs/api';
import styles from '@/styles/announcements.module.scss';

export default function AnnouncementsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAnnouncements = async () => {
            try {
                const data = await fetchAnnouncements();
                setAnnouncements(data);
            } catch (error) {
                console.error('Failed to load announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAnnouncements();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    return (
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={toggleDropdown}
                aria-label="Notifications"
            >
                <span className={styles.bellIcon}><img className={styles.bellIconImg} src="/bell.svg" alt="Bell" /></span>
                {announcements.length > 0 && (
                    <span className={styles.badge}>{announcements.length}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                        <span>Announcements</span>
                    </div>
                    <div className={styles.dropdownList}>
                        {loading ? (
                            <div className={styles.loading}>Loading...</div>
                        ) : announcements.length === 0 ? (
                            <div className={styles.empty}>No announcements</div>
                        ) : (
                            announcements.map((ann) => (
                                <div key={ann.id} className={styles.announcementItem}>
                                    <div className={styles.itemTitle}>{ann.title}</div>
                                    <div className={styles.itemContent}>{ann.content}</div>
                                    {ann.createdAt && (
                                        <div className={styles.itemDate}>
                                            {new Date(ann.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}