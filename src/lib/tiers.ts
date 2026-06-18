import { prisma } from "./db/prisma";

export const TIERS = {
  anonymous: { sessionsPerMonth: 1, messagesPerSession: 30, model: "gpt-4o-mini", canSave: false, canExport: false },
  free:      { sessionsPerMonth: 3, messagesPerSession: 30, model: "gpt-4o-mini", canSave: true,  canExport: false },
  phone:     { sessionsPerMonth: Infinity, messagesPerSession: 120, model: "gpt-4o", canSave: true, canExport: true },
  pro:       { sessionsPerMonth: Infinity, messagesPerSession: Infinity, model: "gpt-4o", canSave: true, canExport: true },
} as const;

export type Tier = keyof typeof TIERS;

export function getCurrentMonth(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const month = getCurrentMonth();
  const usage = await prisma.monthlyUsage.findUnique({
    where: { userId_month: { userId, month } },
  });
  return usage?.sessionCount ?? 0;
}

export async function getAnonymousMonthlyUsage(anonymousId: string): Promise<number> {
  const month = getCurrentMonth();
  const usage = await prisma.monthlyUsage.findUnique({
    where: { anonymousId_month: { anonymousId, month } },
  });
  return usage?.sessionCount ?? 0;
}

export async function incrementMonthlyUsage(userId: string): Promise<void> {
  const month = getCurrentMonth();
  await prisma.monthlyUsage.upsert({
    where: { userId_month: { userId, month } },
    update: { sessionCount: { increment: 1 } },
    create: { userId, month, sessionCount: 1 },
  });
}

export async function incrementAnonymousUsage(anonymousId: string): Promise<void> {
  const month = getCurrentMonth();
  await prisma.monthlyUsage.upsert({
    where: { anonymousId_month: { anonymousId, month } },
    update: { sessionCount: { increment: 1 } },
    create: { anonymousId, month, sessionCount: 1 },
  });
}

export function canCreateSession(tier: Tier, currentUsage: number): boolean {
  const limit = TIERS[tier].sessionsPerMonth;
  return currentUsage < limit;
}

export function getTierConfig(tier: Tier) {
  return TIERS[tier] ?? TIERS.anonymous;
}

export function resolveUserTier(dbUser: { tier: string; smsConsent: boolean; phone: string | null; phoneVerified: boolean } | null): Tier {
  if (!dbUser) return "anonymous";
  if (dbUser.tier === "pro") return "pro";
  if (dbUser.tier === "phone" && dbUser.phoneVerified && dbUser.phone) return "phone";
  if (dbUser.tier === "free" && dbUser.phoneVerified && dbUser.smsConsent && dbUser.phone) return "phone";
  if (dbUser.tier === "free") return "free";
  return "anonymous";
}