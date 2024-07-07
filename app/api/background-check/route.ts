import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { processBackgroundCheck } from '@/lib/ai-model';
import { getOrCreateUser } from '@/lib/user';
import { withRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { memoryCache } from '@/lib/memoryCache';

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

    // Invalidate the cache for this user's background checks
    // Since we can't use wildcards with in-memory cache, we'll clear all cache
    memoryCache.clear()

    return NextResponse.json(backgroundCheck);
  } catch (error) {
    logger.error('Error processing background check', { error, clerkId });
    
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json({ error: 'External API error. Please try again later.' }, { status: 503 });
    }
    
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

  const cacheKey = `background-checks:${user.id}:${page}:${limit}:${search}`;
  const cachedData = memoryCache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json(cachedData);
  }

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

    const result = {
      backgroundChecks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };

    memoryCache.set(cacheKey, result, 300); // Cache for 5 minutes

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching background checks:', error);
    return NextResponse.json({ error: 'Failed to fetch background checks' }, { status: 500 });
  }
}

export const POST = withRateLimit(handlePOST);
export const GET = withRateLimit(handleGET);