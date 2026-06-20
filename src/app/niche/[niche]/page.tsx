import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getMonthlyUsage,
  getAnonymousMonthlyUsage,
  incrementAnonymousUsage,
  getTierConfig,
  getCurrentMonth,
  resolveUserTier,
} from "@/lib/tiers";

export const dynamicParams = true;

type NicheSeedContext = {
  verticalName?: string;
  painPoints?: string[];
  valueOfferCategory?: string;
  exampleOffer?: string;
};

function readSeedContext(raw: unknown): NicheSeedContext {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as NicheSeedContext;
  }
  return {};
}

async function createNichedSession(formData: FormData) {
  "use server";
  const slug = formData.get("nicheSlug") as string;
  const verticalOverride = formData.get("vertical") as string | null;

  const niche = slug
    ? await prisma.niche.findUnique({ where: { slug } })
    : null;

  const seed = readSeedContext(niche?.verticalSeedContext);
  const verticalName =
    verticalOverride?.trim() ||
    seed.verticalName ||
    niche?.headline ||
    slug;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verticalContextInput: any = seed as Record<string, unknown> | undefined;

  if (!verticalName?.trim()) return;

  const { userId } = await auth();
  if (userId) {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

    await prisma.user.upsert({
      where: { id: userId },
      update: { email: email || undefined },
      create: { id: userId, email: email || `user-${userId}@offerfu.com` },
    });

    const freshUser = await prisma.user.findUnique({ where: { id: userId } });
    const tier = resolveUserTier(freshUser);
    const config = getTierConfig(tier);
    const usage = await getMonthlyUsage(userId);

    if (usage >= config.sessionsPerMonth) {
      redirect(tier === "free" ? "/pricing?limit=free" : "/pricing?limit=reached");
    }

    const session = await prisma.session.create({
      data: {
        userId,
        verticalName: verticalName.trim(),
        verticalContext: verticalContextInput,
        nicheSlug: niche?.slug ?? slug,
        status: "discovering",
        model: config.model,
      },
    });

    await prisma.monthlyUsage.upsert({
      where: { userId_month: { userId, month: getCurrentMonth() } },
      update: { sessionCount: { increment: 1 } },
      create: { userId, month: getCurrentMonth(), sessionCount: 1 },
    });

    redirect(`/chat/${session.id}`);
  }

  const cookieStore = await cookies();
  let anonymousId = cookieStore.get("vog_anon_id")?.value;

  if (anonymousId) {
    const usage = await getAnonymousMonthlyUsage(anonymousId);
    if (usage >= 1) redirect("/sign-up");
  } else {
    anonymousId = crypto.randomUUID();
  }

  const session = await prisma.session.create({
    data: {
      anonymousId,
      verticalName: verticalName.trim(),
      verticalContext: verticalContextInput,
      nicheSlug: niche?.slug ?? slug,
      status: "discovering",
      model: "openai/gpt-4o-mini",
    },
  });

  if (!cookieStore.get("vog_anon_id")?.value) {
    await incrementAnonymousUsage(anonymousId!);
  }

  redirect(`/chat/${session.id}`);
}

export default async function NicheLanding({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche: slug } = await params;
  const niche = await prisma.niche.findUnique({
    where: { slug: slug.toLowerCase(), active: true },
  });

  if (!niche) notFound();

  const { userId } = await auth();
  const isLoggedIn = Boolean(userId);

  let remaining: number | null = null;
  if (isLoggedIn) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId! } });
    if (dbUser && !dbUser.termsAcceptedAt) redirect("/terms");
    const tier = resolveUserTier(dbUser);
    const config = getTierConfig(tier);
    const usage = await getMonthlyUsage(userId!);
    remaining =
      config.sessionsPerMonth === Infinity ? null : config.sessionsPerMonth - usage;
  }

  const verticalName =
    readSeedContext(niche?.verticalSeedContext).verticalName ?? niche.headline;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img
              src="/offerfu-logo.png"
              alt="OfferFu Logo"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              OfferFu
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl flex-1 px-6 pt-4 pb-12 lg:pt-8 lg:pb-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="flex flex-col items-center text-center lg:col-span-8 lg:items-start lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              {niche.headline}
            </h2>
            <p className="mt-6 text-xl font-medium text-zinc-600 dark:text-zinc-400">
              {niche.subhead}
            </p>
            <p className="mt-6 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
              {niche.bodyCopy}
            </p>

            <div className="mt-8 w-full max-w-md">
              <form action={createNichedSession} className="flex gap-2">
                <input type="hidden" name="nicheSlug" value={niche.slug} />
                <input
                  type="text"
                  name="vertical"
                  placeholder={verticalName}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 whitespace-nowrap"
                >
                  Start
                </button>
              </form>
              {!isLoggedIn && (
                <p className="mt-3 text-xs text-zinc-400">
                  No account needed for your first session. Sign up to save and export.
                </p>
              )}
            </div>
          </div>

          <div className="relative flex justify-center lg:col-span-4">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-amber-500/10 opacity-60 blur-2xl dark:from-blue-500/20 dark:to-amber-500/20" />
            <div className="relative overflow-hidden [mask-image:radial-gradient(circle_at_center,white_65%,transparent_100%)]">
              <img
                src="/offerfu-hero.png"
                alt="Value Offer and Sales Script Generator Visual"
                className="w-full max-w-[300px] object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>
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

export async function generateMetadata({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: slug } = await params;
  const niche = await prisma.niche.findUnique({ where: { slug: slug.toLowerCase() } });
  if (!niche) return {};
  return {
    title: niche.metaTitle ?? niche.headline,
    description: niche.metaDescription ?? niche.subhead,
  };
}