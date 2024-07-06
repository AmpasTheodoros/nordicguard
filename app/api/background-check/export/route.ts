import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/lib/user';

const prisma = new PrismaClient();

export async function GET() {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  try {
    let backgroundChecks;
    if (user.role === 'ADMIN') {
      backgroundChecks = await prisma.backgroundCheck.findMany({
        orderBy: { initiatedAt: 'desc' },
        include: { initiatedBy: true },
      });
    } else {
      backgroundChecks = await prisma.backgroundCheck.findMany({
        where: { userId: user.id },
        orderBy: { initiatedAt: 'desc' },
      });
    }

    const csvData = [
      user.role === 'ADMIN' 
        ? ['Initiated By', 'Name', 'Personal Number', 'Status', 'Risk Score', 'Flags', 'Initiated At', 'Completed At']
        : ['Name', 'Personal Number', 'Status', 'Risk Score', 'Flags', 'Initiated At', 'Completed At'],
      ...backgroundChecks.map(check => [
        ...(user.role === 'ADMIN' ? [(check as any).initiatedBy?.clerkId || 'N/A'] : []),
        check.name,
        check.personalNumber,
        check.status,
        (check.result as any)?.riskScore?.toFixed(2) || 'N/A',
        (check.result as any)?.flags?.join(', ') || 'N/A',
        check.initiatedAt.toISOString(),
        check.completedAt?.toISOString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=background_checks.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting background checks:', error);
    return NextResponse.json({ error: 'Failed to export background checks' }, { status: 500 });
  }
}