import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      termsAcceptedAt: new Date(),
      email: email ?? undefined,
    },
    create: {
      id: userId,
      email: email ?? `user-${userId}@offerfu.com`,
      termsAcceptedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}