"use client";

import { useState } from "react";
import { PhoneVerificationModal } from "@/components/phone-verification-modal";
import { useRouter } from "next/navigation";

export function PhoneTierCard({ currentTier }: { currentTier: string }) {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const router = useRouter();

  if (currentTier === "phone" || currentTier === "pro") {
    return (
      <div className="block w-full rounded-lg bg-zinc-100 px-4 py-2 text-center text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Unlimited access
      </div>
    );
  }

  if (currentTier === "free") {
    return (
      <>
        {showPhoneModal && (
          <PhoneVerificationModal onSuccess={() => { setShowPhoneModal(false); router.refresh(); }} />
        )}
        <button
          onClick={() => setShowPhoneModal(true)}
          className="block w-full rounded-lg bg-amber-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-700"
        >
          Book Discovery Call
        </button>
      </>
    );
  }

  return null;
}