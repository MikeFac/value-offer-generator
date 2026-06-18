"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneVerificationModal } from "@/components/phone-verification-modal";

export default function UpgradePage() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const router = useRouter();

  if (upgraded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">You&apos;re all set!</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You now have unlimited access to OfferFu. A member of our team will reach out to book your free discovery call.
          </p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
            Start Creating Scripts
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      {showPhoneModal && (
        <PhoneVerificationModal onSuccess={() => { setShowPhoneModal(false); setUpgraded(true); }} />
      )}
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Book Your Discovery Call</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Add your phone number to unlock unlimited scripts, GPT-4o, and exports — and we&apos;ll reach out to book a free 15-minute discovery call about growing your business.
        </p>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            We&apos;ll look at whether <strong>database reactivation</strong>, <strong>outbound campaigns</strong>, an <strong>AI receptionist</strong>, or <strong>delivery automation</strong> can move the needle for you. No pressure, no pitch — just an honest look at what&apos;s possible.
          </p>
        </div>
        <div className="mt-8 space-y-3">
          <button
            onClick={() => setShowPhoneModal(true)}
            className="block w-full rounded-lg bg-amber-600 px-6 py-3 text-center text-sm font-bold text-white hover:bg-amber-700"
          >
            Add Phone Number & Book Call
          </button>
          <p className="text-xs text-zinc-400">
            Your number is only used for verification and follow-up. We never spam.
          </p>
        </div>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What you get</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Unlimited sessions</li>
              <li>GPT-4o model</li>
              <li>Save &amp; export scripts</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What happens next</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>We verify your number</li>
              <li>We reach out to book a call</li>
              <li>15 min, no obligations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}