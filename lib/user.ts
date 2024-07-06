import { PrismaClient, User } from '@prisma/client';
import { auth, clerkClient } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function getOrCreateUser(clerkId: string): Promise<User> {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("User email not found");
    }

    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        role: 'USER',
      },
    });
  }

  return user;
}