import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { processBackgroundCheck } from '@/lib/ai-model';
import { getOrCreateUser } from '@/lib/user';
import { withRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

async function handlePOST(req: NextRequest) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    logger.warn('Unauthorized access attempt', { path: req.url });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const { name, personalNumber } = await req.json();

  try {
    const aiResult = await processBackgroundCheck({ name, personalNumber });

    const backgroundCheck = await prisma.backgroundCheck.create({
      data: {
        status: 'completed',
        name,
        personalNumber,
        result: aiResult,
        userId: user.id,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(backgroundCheck);
  } catch (error) {
    logger.error('Error processing background check', { error, clerkId });
    return NextResponse.json({ error: 'Failed to process background check' }, { status: 500 });
  }
}

async function handleGET(req: NextRequest) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const minRiskScore = searchParams.get('minRiskScore');
  const maxRiskScore = searchParams.get('maxRiskScore');

  try {
    const where: any = {
      userId: user.id,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { personalNumber: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (startDate || endDate) {
      where.initiatedAt = {};
      if (startDate) where.initiatedAt.gte = new Date(startDate);
      if (endDate) where.initiatedAt.lte = new Date(endDate);
    }

    if (minRiskScore || maxRiskScore) {
      where.result = {
        path: ['riskScore'],
        gte: minRiskScore ? parseFloat(minRiskScore) : undefined,
        lte: maxRiskScore ? parseFloat(maxRiskScore) : undefined,
      };
    }

    const [backgroundChecks, total] = await Promise.all([
      prisma.backgroundCheck.findMany({
        where,
        orderBy: { initiatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.backgroundCheck.count({ where }),
    ]);

    return NextResponse.json({
      backgroundChecks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching background checks:', error);
    return NextResponse.json({ error: 'Failed to fetch background checks' }, { status: 500 });
  }
}

export const POST = withRateLimit(handlePOST);
export const GET = withRateLimit(handleGET);