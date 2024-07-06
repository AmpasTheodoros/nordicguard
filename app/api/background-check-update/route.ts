import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      while (true) {
        const [backgroundChecks, total] = await Promise.all([
          prisma.backgroundCheck.findMany({
            where: { initiatedBy: userId },
            orderBy: { initiatedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.backgroundCheck.count({ where: { initiatedBy: userId } }),
        ]);

        const data = {
          backgroundChecks,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before next update
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}