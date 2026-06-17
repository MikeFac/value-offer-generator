import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "owner") redirect("/");

  const sessions = await prisma.session.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Admin — All Sessions
          </h1>
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
          >
            ← Back to App
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {sessions.length === 0 ? (
          <p className="text-zinc-500">No sessions yet.</p>
        ) : (
          sessions.map((s) => (
            <details
              key={s.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.verticalName}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {s.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {s.user?.email ?? s.userId}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(s.updatedAt).toISOString().replace("T", " ").slice(0, 19)}
                </span>
              </summary>
              <div className="border-t border-zinc-200 px-6 py-4 space-y-3 dark:border-zinc-800">
                {s.messages.map((m) => (
                  <div key={m.id} className="flex gap-3">
                    <span
                      className={`w-16 flex-shrink-0 text-right text-xs font-semibold ${
                        m.role === "user"
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500"
                      }`}
                    >
                      {m.role === "user" ? "User" : "AI"}
                    </span>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ))
        )}
      </main>
    </div>
  );
}