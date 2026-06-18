"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SMS_CONSENT_TEXT = "I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.";

export function AcceptTermsForm({ phone }: { phone: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    if (!termsConsent) {
      setError("You must accept the Terms & Conditions.");
      return;
    }
    if (!smsConsent) {
      setError("You must consent to SMS communications to use this service.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smsConsent, smsConsentText: SMS_CONSENT_TEXT }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsConsent}
            onChange={(e) => setTermsConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            I have read and agree to the Terms &amp; Conditions above.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {SMS_CONSENT_TEXT}
          </span>
        </label>
      </div>

      {phone && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          SMS will be sent to {phone}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Accepting..." : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}