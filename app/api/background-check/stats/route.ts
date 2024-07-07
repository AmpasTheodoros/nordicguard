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
    const backgroundChecks = await prisma.backgroundCheck.findMany({
      where: { userId: user.id },
      select: { result: true },
    });

    let lowRisk = 0, mediumRisk = 0, highRisk = 0;
    let totalRiskScore = 0;
    let validChecksCount = 0;

    backgroundChecks.forEach(check => {
      const result = check.result as any; // Type assertion for demonstration
      if (result && typeof result.riskScore === 'number') {
        totalRiskScore += result.riskScore;
        validChecksCount++;
        if (result.riskScore < 30) lowRisk++;
        else if (result.riskScore < 70) mediumRisk++;
        else highRisk++;
      }
    });

    const averageRiskScore = validChecksCount > 0 ? totalRiskScore / validChecksCount : null;

    return NextResponse.json({
      lowRisk,
      mediumRisk,
      highRisk,
      averageRiskScore,
    });
  } catch (error) {
    console.error('Error fetching background check stats:', error);
    return NextResponse.json({ error: 'Failed to fetch background check stats' }, { status: 500 });
  }
}