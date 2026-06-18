import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyUsage, resolveUserTier, getTierConfig } from "@/lib/tiers";
import { SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { headers } from "next/headers";

export default async function PricingPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const limitParam = headersList.get("referer")?.includes("limit=") ? "shown" : null;

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
          Start free. Upgrade when you need more.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div className={`rounded-xl border ${currentTier === "anonymous" ? "border-2 border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"} bg-white p-8 dark:bg-zinc-950`}>
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

          <div className={`rounded-xl border ${currentTier === "free" ? "border-2 border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"} bg-white p-8 dark:bg-zinc-950`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Email</h2>
              {currentTier === "free" && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Current
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
              <li>Save scripts</li>
              <li>Session library</li>
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
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Phone</h2>
              {(currentTier === "phone" || currentTier === "pro") && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Current
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Add your phone number</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Unlimited sessions</li>
              <li>GPT-4o model</li>
              <li>Save &amp; export scripts</li>
              <li>Session library</li>
            </ul>
            <div className="mt-8">
              {currentTier === "free" ? (
                <a
                  href="/sign-up"
                  className="block w-full rounded-lg bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
                >
                  Add Phone Number
                </a>
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

        <div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Why phone?</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This tool is built for outbound sales — so we practice what we preach. When you add your phone number, we gain a high-reach channel to follow up with tips, scripts, and insights. In return, you get unlimited sessions, the better model, and full export. It&apos;s the value-first framework applied to our own product.
          </p>
        </div>
      </main>
    </div>
  );
}