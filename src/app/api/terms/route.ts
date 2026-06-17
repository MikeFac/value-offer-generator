import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: { termsAcceptedAt: new Date() },
    create: { id: userId, email: "", termsAcceptedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}