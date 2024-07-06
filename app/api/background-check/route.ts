import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { processBackgroundCheck } from '@/lib/ai-model';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, personalNumber } = await request.json();

  try {
    // Process with enhanced AI model
    const aiResult = await processBackgroundCheck({ name, personalNumber });

    // Store in database
    const backgroundCheck = await prisma.backgroundCheck.create({
      data: {
        status: 'completed',
        name,
        personalNumber,
        result: aiResult,
        initiatedBy: userId,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(backgroundCheck);
  } catch (error) {
    console.error('Error processing background check:', error);
    return NextResponse.json({ error: 'Failed to process background check' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const [backgroundChecks, total] = await Promise.all([
      prisma.backgroundCheck.findMany({
        where: { initiatedBy: userId },
        orderBy: { initiatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.backgroundCheck.count({ where: { initiatedBy: userId } }),
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