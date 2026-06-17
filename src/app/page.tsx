import { SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getMonthlyUsage, getAnonymousMonthlyUsage, incrementAnonymousUsage, getTierConfig, getCurrentMonth } from "@/lib/tiers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const VERTICALS = [
  "HVAC contractors in Phoenix",
  "Real estate agents in Brisbane",
  "Dental practices in Chicago",
  "Insurance brokers in Texas",
  "Legal services in New York",
  "SaaS companies in San Francisco",
];

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dbUser && !dbUser.termsAcceptedAt) redirect("/terms");

    const tier = (dbUser?.tier as "anonymous" | "free" | "pro") ?? "free";
    const config = getTierConfig(tier);
    const usage = dbUser ? await getMonthlyUsage(userId) : 0;
    const remaining = config.sessionsPerMonth === Infinity ? null : config.sessionsPerMonth - usage;

    async function createSession(formData: FormData) {
      "use server";
      const vertical = formData.get("vertical") as string;
      if (!vertical?.trim()) return;

      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
      const { userId } = await auth();

      if (!userId) redirect(`/sign-in?redirect_url=/?vertical=${encodeURIComponent(vertical)}`);

      await prisma.user.upsert({
        where: { id: userId },
        update: { email },
        create: { id: userId, email },
      });

      const tier = (await prisma.user.findUnique({ where: { id: userId } }))?.tier ?? "free";
      const config = getTierConfig(tier as "anonymous" | "free" | "pro");
      const usage = await getMonthlyUsage(userId);

      if (usage >= config.sessionsPerMonth) {
        redirect("/pricing?limit=reached");
      }

      const model = config.model;
      const session = await prisma.session.create({
        data: {
          userId,
          verticalName: vertical.trim(),
          status: "discovering",
          model,
        },
      });

      await prisma.monthlyUsage.upsert({
        where: { userId_month: { userId, month: getCurrentMonth() } },
        update: { sessionCount: { increment: 1 } },
        create: { userId, month: getCurrentMonth(), sessionCount: 1 },
      });

      redirect(`/chat/${session.id}`);
    }

    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Value Offer Generator
            </h1>
            <div className="flex items-center gap-3">
              {remaining !== null && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {remaining} session{remaining !== 1 ? "s" : ""} left this month
                </span>
              )}
              <UserButton />
            </div>
          </div>
        </header>

        <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Sell by giving first.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            The fastest path to a sale is to not sell on the first two calls.
            Deliver value, build trust, then ask for business. This tool helps you
            craft a free value offer and a complete three-call script for any
            vertical.
          </p>

          <div className="mt-8 w-full max-w-md">
            <form action={createSession} className="flex gap-2">
              <input
                type="text"
                name="vertical"
                placeholder={VERTICALS[0]}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Start
              </button>
            </form>
          </div>

          <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 1</div>
              <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Value Call</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Deliver something genuinely useful. Ask for nothing. Leave them
                thinking &ldquo;that was actually helpful.&rdquo;
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 2</div>
              <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Follow-Up</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Confirm the value landed. Deliver again. Explore their situation.
                Plant a seed about working together.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 3</div>
              <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Ask</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                You&apos;ve earned the right. Make a specific, direct ask. Handle
                objections with more value, not pressure.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  async function createAnonymousSession(formData: FormData) {
    "use server";
    const vertical = formData.get("vertical") as string;
    if (!vertical?.trim()) return;

    const cookieStore = await cookies();
    let anonymousId = cookieStore.get("vog_anon_id")?.value;

    if (anonymousId) {
      const usage = await getAnonymousMonthlyUsage(anonymousId);
      if (usage >= 1) {
        redirect("/pricing?limit=anonymous");
      }
    } else {
      anonymousId = crypto.randomUUID();
    }

    const session = await prisma.session.create({
      data: {
        anonymousId,
        verticalName: vertical.trim(),
        status: "discovering",
        model: "gpt-4o-mini",
      },
    });

    if (!cookieStore.get("vog_anon_id")?.value) {
      await incrementAnonymousUsage(anonymousId!);
    }

    redirect(`/chat/${session.id}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Value Offer Generator
          </h1>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                Sign Up Free
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Sell by giving first.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Try it free — no sign-up required. Enter your target vertical and get a
          complete three-call script powered by AI.
        </p>

        <div className="mt-8 w-full max-w-md">
          <form action={createAnonymousSession} className="flex gap-2">
            <input
              type="text"
              name="vertical"
              placeholder={VERTICALS[0]}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Start Free
            </button>
          </form>
          <p className="mt-3 text-xs text-zinc-400">
            No account needed for your first session. Sign up to save and export.
          </p>
        </div>

        <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 1</div>
            <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Value Call</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Deliver something genuinely useful. Ask for nothing.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 2</div>
            <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Follow-Up</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Confirm the value landed. Deliver again. Plant a seed.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Call 3</div>
            <h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">The Ask</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              You&apos;ve earned the right. Make a specific, direct ask.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}