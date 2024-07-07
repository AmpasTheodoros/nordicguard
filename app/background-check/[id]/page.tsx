import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/lib/user';

const prisma = new PrismaClient();

export default async function BackgroundCheckDetail({ params }: { params: { id: string } }) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser(clerkId);

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
            <p className="font-semibold mt-4">Risk Score: {result.riskScore?.toFixed(2) ?? 'N/A'}</p>
            <p className="font-semibold mt-2">Flags:</p>
            <ul className="list-disc list-inside ml-4">
              {result.flags?.map((flag: string, index: number) => (
                <li key={index}>{flag}</li>
              )) ?? <li>No flags</li>}
            </ul>
            <p className="font-semibold mt-2">Criminal Records:</p>
            <ul className="list-disc list-inside ml-4">
              {result.criminalRecords?.map((record: any, index: number) => (
                <li key={index}>{record.offense} - {record.date}</li>
              )) ?? <li>No criminal records</li>}
            </ul>
            <p className="font-semibold mt-2">Financial Record:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Credit Score: {result.financialRecord?.creditScore ?? 'N/A'}</li>
              <li>Bankruptcies: {result.financialRecord?.bankruptcies ?? 'N/A'}</li>
            </ul>
            <p className="font-semibold mt-2">Employment History:</p>
            <ul className="list-disc list-inside ml-4">
              {result.employmentHistory?.map((job: any, index: number) => (
                <li key={index}>
                  {job.employer} - From: {job.startDate}, To: {job.endDate ?? 'Present'}
                </li>
              )) ?? <li>No employment history available</li>}
            </ul>
          </>
        )}
        <p className="mt-4">Initiated: {new Date(check.initiatedAt).toLocaleString()}</p>
        {check.completedAt && <p>Completed: {new Date(check.completedAt).toLocaleString()}</p>}
      </div>
    </div>
  );
}