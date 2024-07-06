import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/lib/user';
import AdminReportGenerator from '@/components/AdminReportGenerator';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser(clerkId);

  if (user.role !== 'ADMIN') {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();
  const totalBackgroundChecks = await prisma.backgroundCheck.count();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold">Total Background Checks</h2>
          <p className="text-3xl font-bold">{totalBackgroundChecks}</p>
        </div>
      </div>
      <div className="flex space-x-4 mb-8">
        <Link 
          href="/api/background-check/export"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export All Background Checks
        </Link>
        <Link 
          href="/admin/users"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Users
        </Link>
      </div>
      <AdminReportGenerator />
    </div>
  );
}