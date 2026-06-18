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

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const phone = user?.phoneNumbers?.[0]?.phoneNumber ?? null;

  const updateData: Record<string, unknown> = {
    termsAcceptedAt: new Date(),
    email: email || undefined,
  };

  if (smsConsent && phone) {
    updateData.phone = phone;
    updateData.phoneVerified = true;
    updateData.smsConsent = true;
    updateData.smsConsentAt = new Date();
    updateData.smsConsentText = smsConsentText || "";
    updateData.tier = "phone";
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: updateData,
    create: {
      id: userId,
      email: email ?? `user-${userId}@offerfu.com`,
      phone,
      phoneVerified: !!phone,
      termsAcceptedAt: new Date(),
      ...(smsConsent && phone ? {
        smsConsent: true,
        smsConsentAt: new Date(),
        smsConsentText: smsConsentText || "",
        tier: "phone",
      } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}