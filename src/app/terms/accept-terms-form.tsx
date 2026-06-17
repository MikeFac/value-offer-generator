"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcceptTermsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const res = await fetch("/api/terms", { method: "POST" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 flex gap-3">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        I Accept the Terms &amp; Conditions
      </button>
    </div>
  );
}