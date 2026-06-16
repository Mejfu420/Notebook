import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchAnnouncements } from '@/libs/api';
import AdminDashboard from '@/components/elements/AdminDashboard';

export default async function AdminPage() {
    const user = await currentUser();
    const { getToken } = await auth();

    if (user?.publicMetadata?.role !== 'admin') {
        redirect('/notes');
    }

    const token = await getToken();
    const announcements = await fetchAnnouncements();

    return <AdminDashboard token={token} initialAnnouncements={announcements} />;
}