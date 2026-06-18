const TELNYX_API_KEY = process.env.TELNYX_API_KEY || "";
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER || "";
const TELNYX_MESSAGING_PROFILE_ID = process.env.TELNYX_MESSAGING_PROFILE_ID || "";

interface TelnyxSmsResult {
  success: boolean;
  providerId?: string;
  error?: string;
}

export async function sendSmsOtp(phone: string, code: string, userId?: string): Promise<TelnyxSmsResult> {
  const message = `Your OfferFu verification code is: ${code}. It expires in 10 minutes.`;

  if (!TELNYX_API_KEY || !TELNYX_PHONE_NUMBER) {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    await logSms(userId, phone, "otp_verify", message, null, "dev_sent");
    return { success: true, providerId: `dev-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify({
        from: TELNYX_PHONE_NUMBER,
        to: phone,
        text: message,
        messaging_profile_id: TELNYX_MESSAGING_PROFILE_ID || undefined,
      }),
    });

    const data = await res.json();

      if (!res.ok) {
        console.error("Telnyx SMS error:", data);
        const detail = data.errors?.[0]?.detail || data.errors?.[0]?.title || "Failed to send SMS";
        await logSms(userId, phone, "otp_verify", message, null, "failed");
        return { success: false, error: detail };
    }

    const providerId = data.data?.id || null;
    await logSms(userId, phone, "otp_verify", message, providerId, "sent");
    return { success: true, providerId };
  } catch (err) {
    console.error("Telnyx SMS error:", err);
    await logSms(userId, phone, "otp_verify", message, null, "failed");
    return { success: false, error: "Failed to send SMS" };
  }
}

async function logSms(userId: string | null | undefined, phone: string, type: string, message: string, providerId: string | null, status: string) {
  try {
    const { prisma } = await import("./db/prisma");
    await prisma.smsLog.create({
      data: {
        userId: userId || null,
        phone,
        type,
        message,
        providerId: providerId || null,
        status,
      },
    });
  } catch {
    console.error("Failed to log SMS");
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOtpExpired(expiry: Date | null): boolean {
  if (!expiry) return true;
  return new Date() > expiry;
}