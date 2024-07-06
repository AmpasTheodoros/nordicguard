import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BackgroundCheckForm from "@/components/BackgroundCheckForm";
import BackgroundCheckList from "@/components/BackgroundCheckList";

export default function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Background Check Dashboard</h1>
      <p className="mb-4">Welcome to your dashboard. Here you can initiate new background checks and view past results.</p>
      <BackgroundCheckForm />
      <BackgroundCheckList />
    </div>
  );
}