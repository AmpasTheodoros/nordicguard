import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { memoryCache } from '@/lib/memoryCache';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      const backgroundChecks = await prisma.backgroundCheck.findMany({
        where: { userId: user.id },
        orderBy: { initiatedAt: 'desc' },
        take: 10,
      });

      const total = await prisma.backgroundCheck.count({ where: { userId: user.id } });

      const result = {
        backgroundChecks,
        totalPages: Math.ceil(total / 10),
        currentPage: 1,
      };

      memoryCache.set(`background-checks:${user.id}:1:10:`, result, 3600); // Cache for 1 hour
    }

    return NextResponse.json({ message: 'Cache updated successfully' });
  } catch (error) {
    console.error('Error updating cache:', error);
    return NextResponse.json({ error: 'Failed to update cache' }, { status: 500 });
  }
}