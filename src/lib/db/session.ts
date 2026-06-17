import { prisma } from "./prisma";

export async function getSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSession(id: string, userId: string) {
  return prisma.session.findFirst({
    where: { id, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createSession(userId: string, verticalName: string) {
  return prisma.session.create({
    data: { userId, verticalName, status: "discovering" },
  });
}

export async function updateSession(
  id: string,
  data: {
    verticalContext?: Record<string, unknown>;
    valueOffer?: Record<string, unknown>;
    scripts?: Record<string, unknown>;
    status?: string;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.session.update({ where: { id }, data: data as any });
}

export async function createMessage(
  sessionId: string,
  role: string,
  content: string,
  phase: string
) {
  return prisma.message.create({
    data: { sessionId, role, content, phase },
  });
}

export async function getMessages(sessionId: string) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}