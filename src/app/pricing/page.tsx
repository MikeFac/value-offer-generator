import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyUsage } from "@/lib/tiers";
import { SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function PricingPage() {
  const { userId } = await auth();

  let currentTier = "anonymous";
  let sessionsUsed = 0;
  let sessionsLimit = 1;

  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    currentTier = dbUser?.tier ?? "free";
    sessionsUsed = await getMonthlyUsage(userId);
    sessionsLimit = currentTier === "pro" ? Infinity : currentTier === "free" ? 3 : 1;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Value Offer Generator
          </Link>
          <div className="flex items-center gap-3">
            {userId ? <UserButton /> : <SignUpButton mode="modal"><button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">Sign Up Free</button></SignUpButton>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("limit") && (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("limit") === "anonymous"
              ? "You've used your free anonymous session. Sign up to continue creating scripts."
              : "You've reached your monthly session limit. Upgrade to Pro for unlimited access."}
          </div>
        )}

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Choose Your Plan</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Start free. Upgrade when you need more.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Try It Free</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No account needed</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>1 session</li>
              <li>GPT-4o-mini model</li>
              <li>No save or export</li>
              <li>No registration required</li>
            </ul>
            <div className="mt-8">
              <Link
                href="/"
                className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Start Free Session
              </Link>
            </div>
          </div>

          <div className="rounded-xl border-2 border-zinc-900 bg-white p-8 dark:border-zinc-100 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Free</h2>
              {currentTier === "free" && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Current Plan
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign up free</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>3 sessions/month</li>
              <li>GPT-4o-mini model</li>
              <li>Save & export scripts</li>
              <li>Session library</li>
            </ul>
            <div className="mt-8">
              {userId ? (
                <div className="block w-full rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {sessionsUsed}/{sessionsLimit === Infinity ? "∞" : sessionsLimit} sessions used
                </div>
              ) : (
                <SignUpButton mode="modal">
                  <button className="block w-full rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                    Sign Up Free
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pro</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">For power users & teams</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$29</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Unlimited sessions</li>
              <li>GPT-4o model</li>
              <li>Save & export scripts</li>
              <li>Session library</li>
              <li>Priority support</li>
              <li>Included with marketplace campaigns</li>
            </ul>
            <div className="mt-8">
              <button className="block w-full rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}