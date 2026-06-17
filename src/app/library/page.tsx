import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function LibraryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser && !dbUser.termsAcceptedAt) redirect("/terms");

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← Home
            </Link>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              My Sessions
            </h1>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              No sessions yet. Start by entering a vertical on the home page.
            </p>
            <Link
              href="/"
              className="mt-4 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Create a Session
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/chat/${s.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.verticalName}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? "bg-zinc-100 text-zinc-600"}`}
                  >
                    {statusLabels[s.status] ?? s.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Updated {new Date(s.updatedAt).toISOString().slice(0, 10)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}