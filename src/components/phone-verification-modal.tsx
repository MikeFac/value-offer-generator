"use client";

import { useState } from "react";

const SMS_CONSENT_TEXT = "I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.";

export function PhoneVerificationModal({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/phone/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to send verification code.");
      setLoading(false);
      return;
    }

    setStep("otp");
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (!termsConsent) {
      setError("You must accept the Terms & Conditions.");
      return;
    }
    if (!smsConsent) {
      setError("SMS consent is required to add your phone number.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/phone/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otp.trim(), smsConsent: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Verification failed.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
        {step === "phone" ? (
          <>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Add Your Phone Number
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Add your phone number to unlock unlimited sessions, script export, and the GPT-4o model.
            </p>

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1XXXXXXXXXX"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Include country code (e.g. +1 for US)
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Verify Your Number
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              We sent a 6-digit code to <span className="font-mono font-medium">{phone}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center text-2xl tracking-widest text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsConsent}
                    onChange={(e) => setTermsConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    I have read and agree to the{" "}
                    <a href="/terms" target="_blank" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
                      Terms &amp; Conditions
                    </a>.
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

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {loading ? "Verifying..." : "Verify & Upgrade"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Change phone number
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}