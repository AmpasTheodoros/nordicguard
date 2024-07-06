import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOrCreateUser(clerkId: string): Promise<User> {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        role: 'USER',
      },
    });
  }

  return user;
}