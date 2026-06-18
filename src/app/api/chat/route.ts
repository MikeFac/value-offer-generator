import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { buildSystemPrompt, advancePhase, detectPhaseFromContent } from "@/lib/ai";
import { createMessage } from "@/lib/db/session";
import { getEffectiveModel, getClientForModel, getModelIdForProvider } from "@/lib/model";
import { resolveUserTier } from "@/lib/tiers";

const MAX_MESSAGES_FREE = 30;

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  const { sessionId, message } = await req.json();
  if (!sessionId || !message) {
    return NextResponse.json(
      { error: "sessionId and message required" },
      { status: 400 }
    );
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.userId && userId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let effectiveTier: string = "anonymous";
  if (userId) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    effectiveTier = dbUser ? resolveUserTier(dbUser) : "anonymous";
  }

  const model = await getEffectiveModel(effectiveTier as "anonymous" | "free" | "phone" | "pro");

  if (session.messageCount >= MAX_MESSAGES_FREE && model === "openai/gpt-4o-mini") {
    return NextResponse.json(
      { error: "Message limit reached for this session. Sign up for unlimited access." },
      { status: 429 }
    );
  }

  if (session.model !== model) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { model },
    });
  }

  const phaseLabel = getPhaseLabel(session.status);

  if (userId) {
    await createMessage(sessionId, "user", message, phaseLabel);
  } else {
    await prisma.message.create({
      data: { sessionId, role: "user", content: message, phase: phaseLabel },
    });
  }

  const previousMessages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const recentMessages = previousMessages.slice(-20);
  const systemPrompt = buildSystemPrompt(phaseLabel);

  const client = getClientForModel(model);
  const providerModel = getModelIdForProvider(model);

  const chatHistory = recentMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const stream = await client.chat.completions.create({
    model: providerModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
    ],
    stream: true,
  });

  let fullContent = "";
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) {
          fullContent += content;
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();

      if (userId) {
        await createMessage(sessionId, "assistant", fullContent, phaseLabel);
      } else {
        await prisma.message.create({
          data: { sessionId, role: "assistant", content: fullContent, phase: phaseLabel },
        });
      }

      const detected = detectPhaseFromContent(fullContent);
      let newStatus = session.status;
      if (detected === "design") newStatus = "designing";
      else if (detected === "generation") newStatus = "generated";
      else if (detected === "export") newStatus = "complete";
      else newStatus = advancePhase(session.status, fullContent);

      const scripts = extractScripts(fullContent);

      const updateData: Record<string, unknown> = {
        status: newStatus,
        messageCount: session.messageCount + 2,
      };
      if (scripts) updateData.scripts = scripts;
      if (detected === "design" || newStatus === "designing") {
        updateData.verticalContext = {};
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.session.update({
        where: { id: sessionId },
        data: updateData as any,
      });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

function getPhaseLabel(status: string): string {
  const map: Record<string, string> = {
    discovering: "discovery",
    designing: "design",
    generated: "generation",
    complete: "export",
  };
  return map[status] ?? "discovery";
}

function extractScripts(content: string): unknown | null {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}