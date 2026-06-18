import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyUsage, resolveUserTier, getTierConfig, TIERS } from "@/lib/tiers";
import { SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function PricingPage() {
  const { userId } = await auth();

  let currentTier = "anonymous";
  let sessionsUsed = 0;
  let sessionsLimit = 1;

  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const tier = resolveUserTier(dbUser);
    currentTier = tier;
    sessionsUsed = await getMonthlyUsage(userId);
    const config = getTierConfig(tier);
    sessionsLimit = config.sessionsPerMonth;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            OfferFu
          </Link>
          <div className="flex items-center gap-3">
            {userId ? <UserButton /> : <SignUpButton mode="redirect"><button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">Sign Up Free</button></SignUpButton>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Choose Your Plan</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Start free. Add your phone to unlock unlimited scripts — and book a free discovery call about growing your business.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div className={`rounded-xl border ${currentTier === "anonymous" ? "border-2 border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"} bg-white p-8 dark:bg-zinc-950`}>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{TIERS.anonymous.label}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{TIERS.anonymous.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              {TIERS.anonymous.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div className="mt-8">
              <Link href="/" className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Start Free Session
              </Link>
            </div>
          </div>

          <div className={`rounded-xl border ${currentTier === "free" ? "border-2 border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"} bg-white p-8 dark:bg-zinc-950`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{TIERS.free.label}</h2>
              {currentTier === "free" && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">Current</span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{TIERS.free.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              {TIERS.free.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div className="mt-8">
              {userId ? (
                <div className="block w-full rounded-lg bg-zinc-100 px-4 py-2 text-center text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {sessionsUsed}/{sessionsLimit === Infinity ? "∞" : sessionsLimit} used
                </div>
              ) : (
                <SignUpButton mode="redirect">
                  <button className="block w-full rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                    Sign Up Free
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>

          <div className={`rounded-xl border ${currentTier === "phone" || currentTier === "pro" ? "border-2 border-amber-600" : "border-zinc-200 dark:border-zinc-800"} bg-white p-8 dark:bg-zinc-950`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{TIERS.phone.label}</h2>
              {(currentTier === "phone" || currentTier === "pro") && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">Current</span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{TIERS.phone.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              {TIERS.phone.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div className="mt-8">
              {currentTier === "free" ? (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Click &quot;Book Discovery Call&quot; in any chat to upgrade.
                </p>
              ) : currentTier === "phone" || currentTier === "pro" ? (
                <div className="block w-full rounded-lg bg-zinc-100 px-4 py-2 text-center text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  Unlimited access
                </div>
              ) : (
                <SignUpButton mode="redirect">
                  <button className="block w-full rounded-lg bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700">
                    Get Started
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">What happens when you add your phone?</h3>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            You unlock unlimited scripts and GPT-4o — that&apos;s the table stakes. The real value: we reach out to book a 15-minute discovery call about <strong>your</strong> business. We&apos;ll look at whether database reactivation, outbound campaigns, an AI receptionist, or delivery automation can move the needle for you. No pressure, no pitch — just an honest look at what&apos;s possible.
          </p>
        </div>
      </main>
    </div>
  );
}