import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/lib/user';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    let report;
    switch (reportType) {
      case 'riskDistribution':
        report = await generateRiskDistributionReport(user.id, startDate, endDate);
        break;
      case 'checkVolume':
        report = await generateCheckVolumeReport(user.id, startDate, endDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateRiskDistributionReport(userId: string, startDate: string | null, endDate: string | null) {
  const where = {
    userId,
    ...(startDate && endDate ? {
      initiatedAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } : {}),
  };

  const backgroundChecks = await prisma.backgroundCheck.findMany({
    where,
    select: {
      result: true,
    },
  });

  const riskDistribution = {
    low: 0,
    medium: 0,
    high: 0,
  };

  backgroundChecks.forEach((check) => {
    const riskScore = (check.result as any)?.riskScore;
    if (riskScore !== undefined) {
      if (riskScore < 30) riskDistribution.low++;
      else if (riskScore < 70) riskDistribution.medium++;
      else riskDistribution.high++;
    }
  });

  return riskDistribution;
}

async function generateCheckVolumeReport(userId: string, startDate: string | null, endDate: string | null) {
  const where = {
    userId,
    ...(startDate && endDate ? {
      initiatedAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } : {}),
  };

  const checkVolume = await prisma.backgroundCheck.count({ where });

  return { totalChecks: checkVolume };
}