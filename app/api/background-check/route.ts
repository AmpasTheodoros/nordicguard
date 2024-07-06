import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { processBackgroundCheck } from '@/lib/ai-model';
import { getOrCreateUser } from '@/lib/user';
import { sendNotificationEmail } from '@/lib/sendgrid';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const { name, personalNumber } = await request.json();

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

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Background check for ${name} has been completed.`,
      },
    });

    // Send email notification
    await sendNotificationEmail(
      user.email, // You'll need to add an email field to your User model
      'Background Check Completed',
      `The background check for ${name} has been completed. Please log in to view the results.`
    );

    return NextResponse.json(backgroundCheck);
  } catch (error) {
    console.error('Error processing background check:', error);
    return NextResponse.json({ error: 'Failed to process background check' }, { status: 401 });
  }
}

export async function GET(request: Request) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getOrCreateUser(clerkId);

  const { searchParams } = new URL(request.url);
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