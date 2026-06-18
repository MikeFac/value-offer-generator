import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { isOtpExpired } from "@/lib/telnyx";

const SMS_CONSENT_TEXT = "I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, smsConsent } = body;

  if (!code) {
    return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!dbUser.phone) {
    return NextResponse.json({ error: "No phone number on file. Send a verification code first." }, { status: 400 });
  }

  if (!dbUser.phoneVerificationCode || !dbUser.phoneVerificationExpiry) {
    return NextResponse.json({ error: "No verification code sent. Request a new one." }, { status: 400 });
  }

  if (isOtpExpired(dbUser.phoneVerificationExpiry)) {
    return NextResponse.json({ error: "Verification code expired. Request a new one." }, { status: 400 });
  }

  if (dbUser.phoneVerificationCode !== code) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  const smsConsentBool = smsConsent === true;

  await prisma.user.update({
    where: { id: userId },
    data: {
      phoneVerified: true,
      phoneVerificationCode: null,
      phoneVerificationExpiry: null,
      ...(smsConsentBool ? {
        smsConsent: true,
        smsConsentAt: new Date(),
        smsConsentText: SMS_CONSENT_TEXT,
        tier: "phone",
      } : {}),
    },
  });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? dbUser.email;

  if (email && email !== dbUser.email) {
    await prisma.user.update({
      where: { id: userId },
      data: { email },
    });
  }

  return NextResponse.json({
    ok: true,
    phoneVerified: true,
    tier: smsConsentBool ? "phone" : dbUser.tier,
  });
}