import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function BackgroundCheckDetail({ params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const check = await prisma.backgroundCheck.findUnique({
    where: { id: params.id },
  });

  if (!check) {
    return <div>Background check not found</div>;
  }

  const result = check.result as any; // Type assertion for demonstration

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Background Check Detail</h1>
      <div className="border p-4 rounded-md">
        <h2 className="text-xl font-semibold">{check.name}</h2>
        <p>Personal Number: {check.personalNumber}</p>
        <p>Status: {check.status}</p>
        {result && (
          <>
            <p className="font-semibold mt-4">Risk Score: {result.riskScore.toFixed(2)}</p>
            <p className="font-semibold mt-2">Flags:</p>
            <ul className="list-disc list-inside ml-4">
              {result.flags.map((flag: string, index: number) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
            <p className="font-semibold mt-2">Categories:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Financial: {result.categories.financial}</li>
              <li>Criminal: {result.categories.criminal}</li>
              <li>Employment: {result.categories.employment}</li>
            </ul>
            <p className="font-semibold mt-2">Recommendations:</p>
            <ul className="list-disc list-inside ml-4">
              {result.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-4">Initiated: {new Date(check.initiatedAt).toLocaleString()}</p>
        {check.completedAt && <p>Completed: {new Date(check.completedAt).toLocaleString()}</p>}
      </div>
    </div>
  );
}