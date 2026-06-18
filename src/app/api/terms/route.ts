import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { smsConsent, smsConsentText } = body;

  if (!smsConsent) {
    return NextResponse.json({ error: "SMS consent is required." }, { status: 400 });
  }

  const user = await currentUser();
  const phone = user?.phoneNumbers?.[0]?.phoneNumber ?? null;

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      termsAcceptedAt: new Date(),
      smsConsent: true,
      smsConsentAt: new Date(),
      smsConsentText: smsConsentText || "",
      phone,
      phoneVerified: !!phone,
      email: user?.emailAddresses?.[0]?.emailAddress ?? undefined,
    },
    create: {
      id: userId,
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
      phone,
      phoneVerified: !!phone,
      termsAcceptedAt: new Date(),
      smsConsent: true,
      smsConsentAt: new Date(),
      smsConsentText: smsConsentText || "",
    },
  });

  return NextResponse.json({ ok: true });
}