"use client";

import { useState, useEffect } from "react";
import { MODEL_LABELS, ALLOWED_MODELS } from "@/lib/models";

export function ModelSettings() {
  const [currentModel, setCurrentModel] = useState("openai/gpt-4o-mini");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.model) setCurrentModel(d.model);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: currentModel }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Default AI Model (for phone/pro tiers)
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Anonymous and email tiers always use GPT-4o Mini. This model is used for phone and pro tier sessions.
        </p>
        <select
          value={currentModel}
          onChange={(e) => setCurrentModel(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {ALLOWED_MODELS.map((m) => (
            <option key={m} value={m}>
              {MODEL_LABELS[m] ?? m}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Current: <span className="font-mono">{MODEL_LABELS[currentModel] ?? currentModel}</span>
        </span>
      </div>
    </div>
  );
}