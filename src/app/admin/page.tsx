import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "owner") redirect("/");

  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const activeTab = params.tab ?? "sessions";

  const where = query
    ? {
        OR: [
          { user: { email: { contains: query, mode: "insensitive" as const } } },
          { user: { phone: { contains: query, mode: "insensitive" as const } } },
          { verticalName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [sessions, users] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { email: true, phone: true, tier: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        tier: true,
        phoneVerified: true,
        smsConsent: true,
        smsConsentAt: true,
        termsAcceptedAt: true,
        createdAt: true,
        _count: { select: { sessions: true } },
      },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    discovering: "Discovery",
    designing: "Design",
    generated: "Script Generated",
    complete: "Complete",
  };

  const statusColors: Record<string, string> = {
    discovering: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    designing: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    generated: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    complete: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  const tierColors: Record<string, string> = {
    free: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    phone: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    pro: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    anonymous: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  const tierLabels: Record<string, string> = {
    free: "Email",
    phone: "Phone",
    pro: "Pro",
    anonymous: "Anon",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            OfferFu Admin
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
            >
              ← Back to App
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <a
              href={`/admin?tab=sessions${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                activeTab === "sessions"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Sessions ({sessions.length})
            </a>
            <a
              href={`/admin?tab=users${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                activeTab === "users"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Users ({users.length})
            </a>
          </nav>

          <form method="get" className="flex gap-2">
            <input type="hidden" name="tab" value={activeTab} />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by email, phone, or vertical..."
              className="w-72 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Search
            </button>
            {query && (
              <a
                href={`/admin?tab=${activeTab}`}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-400"
              >
                Clear
              </a>
            )}
          </form>
        </div>

        {activeTab === "sessions" && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
                {query ? `No sessions matching "${query}"` : "No sessions yet."}
              </div>
            ) : (
              sessions.map((s) => (
                <details
                  key={s.id}
                  className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <summary className="cursor-pointer px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {s.verticalName}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status] ?? "bg-zinc-100 text-zinc-600"}`}
                      >
                        {statusLabels[s.status] ?? s.status}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {s.model}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {s.user?.email ?? s.user?.phone ?? (s.anonymousId ? `anon:${s.anonymousId.slice(0, 8)}...` : s.userId?.slice(0, 12) ?? "unknown")}
                      </span>
                      {s.user?.tier && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColors[s.user.tier] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {tierLabels[s.user.tier] ?? s.user.tier}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 ml-4 whitespace-nowrap">
                      {new Date(s.updatedAt).toISOString().replace("T", " ").slice(0, 16)}
                    </span>
                  </summary>
                  <div className="border-t border-zinc-200 px-6 py-4 space-y-3 dark:border-zinc-800">
                    {s.scripts && (
                      <div className="rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        Script generated — {((s.scripts as Record<string, unknown>)?.channel_strategy as Record<string, string>)?.primary_channel
                          ? `Channel: ${((s.scripts as Record<string, unknown>)?.channel_strategy as Record<string, string>)?.primary_channel}`
                          : "No channel strategy"}
                      </div>
                    )}
                    {s.messages.map((m) => (
                      <div key={m.id} className="flex gap-3">
                        <span
                          className={`w-16 flex-shrink-0 text-right text-xs font-semibold ${
                            m.role === "user"
                              ? "text-zinc-900 dark:text-zinc-100"
                              : m.role === "assistant"
                                ? "text-zinc-500"
                                : "text-zinc-400"
                          }`}
                        >
                          {m.role === "user" ? "User" : m.role === "assistant" ? "AI" : "System"}
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                          {m.content.length > 500 ? m.content.slice(0, 500) + "..." : m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Sessions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">T&Cs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">SMS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">{u.email ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 font-mono">{u.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColors[u.tier] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {tierLabels[u.tier] ?? u.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{u.role}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{u._count.sessions}</td>
                      <td className="px-4 py-3 text-sm">
                        {u.termsAcceptedAt ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {u.smsConsent ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {new Date(u.createdAt).toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}