import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { userId } = await auth();

  const { sessionId } = await params;
  const session = await prisma.session.findFirst({
    where: { id: sessionId },
  });

  if (!session || !session.scripts) {
    return NextResponse.json(
      { error: "Session or scripts not found" },
      { status: 404 }
    );
  }

  if (!session.userId) {
    return NextResponse.json(
      { error: "Sign up required to export scripts" },
      { status: 403 }
    );
  }

  if (userId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const s = session.scripts as Record<string, unknown>;
  const channelStrategy = s.channel_strategy as Record<string, string> | null;
  const valueOffer = s.value_offer as Record<string, string>;
  const call1 = s.call_1 as Record<string, unknown>;
  const call2 = s.call_2 as Record<string, unknown>;
  const call3 = s.call_3 as Record<string, unknown>;
  const timing = s.timing as Record<string, string>;
  const touchpoints = s.between_call_touchpoints as string[];

  const channelLabels: Record<string, string> = {
    outbound_telemarketing: "Outbound Telemarketing",
    ai_automation: "AI Automation",
    combined: "Combined (Outbound + AI Automation)",
  };

  const lines: string[] = [];
  lines.push("=".repeat(60));
  lines.push(`THREE-CALL SCRIPT PACKAGE`);
  lines.push(`Vertical: ${s.vertical}`);
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("=".repeat(60));
  lines.push("");

  if (channelStrategy) {
    lines.push("--- CHANNEL STRATEGY ---");
    lines.push(`Primary Channel: ${channelLabels[channelStrategy.primary_channel] ?? channelStrategy.primary_channel}`);
    lines.push(`Recommendation: ${channelStrategy.recommendation}`);
    lines.push(`Database Size: ${channelStrategy.database_size}`);
    lines.push(`Core Problem: ${channelStrategy.core_problem?.replace(/_/g, " ")}`);
    lines.push("");
  }

  lines.push("--- VALUE OFFER ---");
  lines.push(`Type: ${valueOffer?.type}`);
  lines.push(`Description: ${valueOffer?.description}`);
  lines.push(`Delivery Method: ${valueOffer?.delivery_method}`);
  lines.push(`Why It Works: ${valueOffer?.why_it_works}`);
  lines.push("");

  const formatCall = (
    call: Record<string, unknown>,
    label: string
  ) => {
    lines.push(`--- ${label} ---`);
    lines.push(`Duration Target: ${call.duration_target as string}`);
    lines.push("");
    lines.push("OPENER:");
    lines.push(call.opener as string);
    lines.push("");
    lines.push("BODY:");
    lines.push(call.body as string);
    lines.push("");
    lines.push("CLOSE:");
    lines.push(call.close as string);
    lines.push("");
    if (call.tonality_notes) {
      lines.push(`TONALITY: ${call.tonality_notes as string}`);
      lines.push("");
    }
    const handles = call.objection_handles as Array<{
      objection: string;
      response: string;
    }>;
    if (handles && handles.length > 0) {
      lines.push("OBJECTION HANDLES:");
      handles.forEach((h) => {
        lines.push(`  Objection: ${h.objection}`);
        lines.push(`  Response: ${h.response}`);
        lines.push("");
      });
    }
  };

  formatCall(call1, "CALL 1 — THE VALUE CALL");
  lines.push("");
  formatCall(call2, "CALL 2 — THE FOLLOW-UP");
  lines.push("");
  formatCall(call3, "CALL 3 — THE ASK");
  lines.push("");

  lines.push("--- TIMING ---");
  lines.push(`Call 1 → Call 2: ${timing?.call_1_to_2}`);
  lines.push(`Call 2 → Call 3: ${timing?.call_2_to_3}`);
  lines.push("");

  if (touchpoints && touchpoints.length > 0) {
    lines.push("--- BETWEEN-CALL TOUCHPOINTS ---");
    touchpoints.forEach((t) => lines.push(`• ${t}`));
  }

  const filename = (session.verticalName as string).replace(/\s+/g, "-").toLowerCase();

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-script.txt"`,
    },
  });
}