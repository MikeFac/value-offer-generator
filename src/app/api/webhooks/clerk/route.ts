import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  let evt: Record<string, unknown>;
  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = evt.type as string;
  const data = evt.data as Record<string, unknown>;

  if (eventType === "user.created" || eventType === "user.updated") {
    const userId = data.id as string;
    const emailAddresses = data.email_addresses as Array<{ email_address: string; id: string }>;
    const phoneNumbers = data.phone_numbers as Array<{ phone_number: string; id: string }>;
    const primaryEmailAddressId = data.primary_email_address_id as string;
    const primaryPhoneNumberId = data.primary_phone_number_id as string;

    const email = emailAddresses?.find((e) => e.id === primaryEmailAddressId)?.email_address
      ?? emailAddresses?.[0]?.email_address
      ?? null;
    const phone = phoneNumbers?.find((p) => p.id === primaryPhoneNumberId)?.phone_number
      ?? phoneNumbers?.[0]?.phone_number
      ?? null;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (existingUser) {
      const updateData: Record<string, unknown> = {
        email: email ?? existingUser.email,
        phone: phone ?? existingUser.phone,
        phoneVerified: phone ? true : existingUser.phoneVerified,
      };

      if (phone && existingUser.smsConsent) {
        updateData.tier = "phone";
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    } else {
      await prisma.user.create({
        data: {
          id: userId,
          email: email ?? `user-${userId}@offerfu.com`,
          phone,
          phoneVerified: !!phone,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}