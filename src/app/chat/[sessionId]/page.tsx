import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { ChatWorkspace } from "./chat-workspace";

type SessionData = {
  id: string;
  verticalName: string;
  status: string;
  valueOffer: unknown | null;
  scripts: unknown | null;
  isAnonymous: boolean;
  canSaveExport: boolean;
  messages: {
    id: string;
    role: string;
    content: string;
    phase: string;
    createdAt: string;
  }[];
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const { userId } = await auth();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) redirect("/");

  const isAnonymous = !session.userId;

  if (session.userId && !userId) redirect("/");
  if (session.userId && userId && session.userId !== userId) redirect("/");

  let canSaveExport = false;
  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    canSaveExport = dbUser?.smsConsent === true;
  }

  const sessionData: SessionData = {
    id: session.id,
    verticalName: session.verticalName,
    status: session.status,
    valueOffer: session.valueOffer,
    scripts: session.scripts,
    isAnonymous,
    canSaveExport,
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      phase: m.phase,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return <ChatWorkspace session={sessionData} />;
}