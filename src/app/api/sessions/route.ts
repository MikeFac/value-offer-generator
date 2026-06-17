import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMonthlyUsage, getTierConfig } from "@/lib/tiers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  const tier = (dbUser?.tier ?? "free") as "anonymous" | "free" | "pro";
  const config = getTierConfig(tier);
  const usage = await getMonthlyUsage(userId);
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    tier,
    sessionsUsed: usage,
    sessionsLimit: config.sessionsPerMonth === Infinity ? null : config.sessionsPerMonth,
    sessions,
  });
}