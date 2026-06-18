import { prisma } from "./db/prisma";
import { MODEL_LABELS, ALLOWED_MODELS } from "./models";

export { MODEL_LABELS, ALLOWED_MODELS };

export const TIERS = {
  anonymous: { sessionsPerMonth: 1, messagesPerSession: 30, model: "openai/gpt-4o-mini", canSave: false, canExport: false, label: "Try It Free", shortLabel: "Free", cta: "Start Free Session", description: "No account needed", features: ["1 session", "GPT-4o Mini model", "No save or export", "No registration required"] },
  free:      { sessionsPerMonth: 3, messagesPerSession: 30, model: "openai/gpt-4o-mini", canSave: true,  canExport: false, label: "Email", shortLabel: "Email", cta: "Sign Up Free", description: "Save scripts, book a discovery call", features: ["3 sessions/month", "GPT-4o Mini model", "Save scripts", "Session library"] },
  phone:     { sessionsPerMonth: Infinity, messagesPerSession: 120, model: "openai/gpt-4o", canSave: true, canExport: true, label: "Discovery Call", shortLabel: "Phone", cta: "Book Discovery Call", description: "Unlock unlimited + talk to us about growing your business", features: ["Unlimited sessions", "GPT-4o model", "Save & export scripts", "Book a free discovery call"] },
  pro:       { sessionsPerMonth: Infinity, messagesPerSession: Infinity, model: "openai/gpt-4o", canSave: true, canExport: true, label: "Pro", shortLabel: "Pro", cta: "Pro Access", description: "Full access, managed by OfferFu", features: ["Unlimited everything", "GPT-4o model", "Priority support", "Custom integrations"] },
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