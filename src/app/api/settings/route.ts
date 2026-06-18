import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { ALLOWED_MODELS } from "@/lib/tiers";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.appSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ model: settings?.model ?? "openai/gpt-4o-mini", allowedModels: ALLOWED_MODELS });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { model } = await req.json();
  if (!model || !ALLOWED_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model", allowedModels: ALLOWED_MODELS }, { status: 400 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: "default" },
    update: { model },
    create: { id: "default", model },
  });

  return NextResponse.json({ model: settings.model });
}