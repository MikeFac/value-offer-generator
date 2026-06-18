import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { sendSmsOtp, generateOtp } from "@/lib/telnyx";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { phone } = body;

  if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number in E.164 format (e.g. +1XXXXXXXXXX)" }, { status: 400 });
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone && existingPhone.id !== userId) {
    return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
  }

  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      phone,
      phoneVerificationCode: otp,
      phoneVerificationExpiry: expiry,
      phoneVerified: false,
    },
    create: {
      id: userId,
      phone,
      phoneVerificationCode: otp,
      phoneVerificationExpiry: expiry,
      phoneVerified: false,
      email: (await currentUser())?.emailAddresses?.[0]?.emailAddress ?? `user-${userId}@offerfu.com`,
    },
  });

  const result = await sendSmsOtp(phone, otp, userId);

  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send verification code" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Verification code sent" });
}