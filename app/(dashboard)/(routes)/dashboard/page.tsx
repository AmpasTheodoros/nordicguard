import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import BackgroundCheckForm from "@/components/BackgroundCheckForm";
import BackgroundCheckList from "@/components/BackgroundCheckList";
import BackgroundCheckStats from "@/components/BackgroundCheckStats";
import NotificationBell from "@/components/NotificationBell";
import { getOrCreateUser } from '@/lib/user';

export default async function Dashboard() {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser(clerkId);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Background Check Dashboard</h1>
        <NotificationBell />
      </div>
      {user.role === 'ADMIN' && (
        <Link href="/admin" className="text-blue-500 hover:underline mb-4 block">
          Go to Admin Dashboard
        </Link>
      )}
      <p className="mb-4">Welcome to your dashboard. Here you can initiate new background checks and view past results.</p>
      <BackgroundCheckForm />
      <BackgroundCheckStats />
      <BackgroundCheckList />
    </div>
  );
}