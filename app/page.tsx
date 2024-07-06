import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default function Home() {
  const { userId } = auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">AI Background Check System</h1>
      {userId ? (
        <p>Welcome, you are signed in!</p>
      ) : (
        <Link href="/sign-in">Sign In</Link>
      )}
    </main>
  )
}