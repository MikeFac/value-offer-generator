"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { PhoneVerificationModal } from "@/components/phone-verification-modal";

type Message = {
  id: string;
  role: string;
  content: string;
  phase: string;
  createdAt: string;
};

type Session = {
  id: string;
  verticalName: string;
  status: string;
  valueOffer: unknown | null;
  scripts: unknown | null;
  isAnonymous: boolean;
  canSave: boolean;
  canExport: boolean;
  messages: Message[];
};

function stripJsonBlocks(text: string): string {
  return text.replace(/```json\s*[\s\S]*?```/g, "").trim();
}

function hasJsonBlock(text: string): boolean {
  return /```json/.test(text);
}

function ScriptPreview({ scripts }: { scripts: unknown | null }) {
  if (!scripts) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-400">
        Your three-call script package will appear here once the AI generates it.
      </div>
    );
  }

  const s = scripts as Record<string, unknown>;
  const channelStrategy = s.channel_strategy as Record<string, string> | null;
  const valueOffer = s.value_offer as Record<string, string>;
  const call1 = s.call_1 as Record<string, unknown>;
  const call2 = s.call_2 as Record<string, unknown>;
  const call3 = s.call_3 as Record<string, unknown>;
  const timing = s.timing as Record<string, string>;
  const touchpoints = s.between_call_touchpoints as string[];

  const channelLabels: Record<string, string> = {
    outbound_telemarketing: "Outbound Telemarketing",
    ai_automation: "AI Automation",
    combined: "Combined (Outbound + AI Automation)",
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vertical</h3>
        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.vertical as string}</p>
      </div>

      {channelStrategy && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">Channel Strategy</h3>
          <p className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">{channelLabels[channelStrategy.primary_channel] ?? channelStrategy.primary_channel}</p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{channelStrategy.recommendation}</p>
          <div className="mt-2 flex gap-3 text-xs text-blue-600 dark:text-blue-400">
            <span>Database: {channelStrategy.database_size}</span>
            <span>Problem: {channelStrategy.core_problem?.replace(/_/g, " ")}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Value Offer</h3>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{valueOffer?.type}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{valueOffer?.description}</p>
        <p className="mt-1 text-xs text-zinc-500">Delivery: {valueOffer?.delivery_method}</p>
      </div>

      {[
        { call: call1, label: "Call 1 — The Value Call" },
        { call: call2, label: "Call 2 — The Follow-Up" },
        { call: call3, label: "Call 3 — The Ask" },
      ].map(({ call, label }) => (
        <div key={label} className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</h3>
          {call && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-zinc-500">Opener:</span> <span className="text-zinc-800 dark:text-zinc-200">{call.opener as string}</span></div>
              <div><span className="font-medium text-zinc-500">Body:</span> <span className="text-zinc-800 dark:text-zinc-200">{call.body as string}</span></div>
              <div><span className="font-medium text-zinc-500">Close:</span> <span className="text-zinc-800 dark:text-zinc-200">{call.close as string}</span></div>
              {(call.objection_handles as Array<{ objection: string; response: string }>)?.length > 0 && (
                <div className="ml-4 space-y-1">
                  <span className="font-medium text-zinc-500">Objection Handles:</span>
                  {(call.objection_handles as Array<{ objection: string; response: string }>).map((oh, i) => (
                    <div key={i} className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="italic">{oh.objection}</span> → {oh.response}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-zinc-400 italic">{call.tonality_notes as string}</p>
            </div>
          )}
        </div>
      ))}

      {timing && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Timing</h3>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Call 1 → 2: {timing.call_1_to_2} &nbsp;|&nbsp; Call 2 → 3: {timing.call_2_to_3}
          </p>
        </div>
      )}

      {touchpoints && touchpoints.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Between-Call Touchpoints</h3>
          <ul className="mt-1 list-disc pl-4 text-sm text-zinc-700 dark:text-zinc-300">
            {touchpoints.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ChatWorkspace({ session: initialSession }: { session: Session }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialSession.messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialSession.status);
  const [currentScripts, setCurrentScripts] = useState<Record<string, unknown> | null>(initialSession.scripts as Record<string, unknown> | null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const isAnonymous = initialSession.isAnonymous;
  const canSave = initialSession.canSave;
  const canExport = initialSession.canExport;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/sessions/${initialSession.id}`, { method: "PUT" });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      phase: currentStatus === "discovering" ? "discovery" : currentStatus === "designing" ? "design" : currentStatus === "generated" ? "generation" : "export",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: initialSession.id, message: userMessage.content }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        phase: "generation",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantContent };
            return updated;
          });

          const extracted = extractScriptsFromContent(assistantContent);
          if (extracted) setCurrentScripts(extracted);
        }
      }

      const statusRes = await fetch(`/api/sessions/${initialSession.id}`);
      if (statusRes.ok) {
        const updated = await statusRes.json();
        setCurrentStatus(updated.status);
        if (updated.scripts) setCurrentScripts(updated.scripts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function extractScriptsFromContent(content: string): Record<string, unknown> | null {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { return null; }
    }
    return null;
  }

  const phaseLabels: Record<string, string> = {
    discovering: "Discovery",
    designing: "Design",
    generated: "Script Generated",
    complete: "Complete",
  };

  return (
    <>
      {showPhoneModal && (
        <PhoneVerificationModal onSuccess={() => { setShowPhoneModal(false); router.refresh(); }} />
      )}
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">← Back</button>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{initialSession.verticalName}</h1>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{phaseLabels[currentStatus] ?? currentStatus}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">My Sessions</button>
            {isAnonymous ? (
              <a href="/sign-up" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">Sign Up to Save</a>
            ) : (
              <UserButton />
            )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  Describe your target vertical and I&apos;ll help you craft a value offer and script.
                </div>
              )}
              {messages.map((msg) => {
                const displayContent = msg.role === "assistant" ? stripJsonBlocks(msg.content) : msg.content;
                if (!displayContent) return null;
                return (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"}`}>
                      {displayContent}
                      {msg.role === "assistant" && hasJsonBlock(msg.content) && (
                        <div className="mt-2 rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Script generated — see preview panel
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-400 dark:bg-zinc-800">Thinking...</div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-zinc-200 bg-white p-4 pb-16 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={currentStatus === "discovering" ? "Tell me about your target vertical..." : currentStatus === "designing" ? "Which value offer appeals to you?" : "Ask for tweaks or say it looks good..."}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">Send</button>
              </div>
            </form>
          </div>

          <div className="hidden w-96 flex-shrink-0 lg:flex lg:flex-col">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Script Preview</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScriptPreview scripts={currentScripts} />
            </div>
            {currentScripts !== null && (
              <div className="border-t border-zinc-200 bg-zinc-50 p-4 space-y-2 dark:border-zinc-800 dark:bg-zinc-950">
                {!canSave && isAnonymous && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign up free to save your scripts.</p>
                    <a href="/sign-up" className="mt-2 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">Sign Up Free</a>
                  </div>
                )}
                {canSave && !canExport && (
                  <>
                    <button onClick={handleSave} disabled={saving} className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                      {saved ? "Saved ✓" : saving ? "Saving..." : "Save Script"}
                    </button>
                    <button onClick={() => setShowPhoneModal(true)} className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
                      Add Phone to Export & Unlock Unlimited
                    </button>
                  </>
                )}
                {canSave && canExport && (
                  <>
                    <button onClick={handleSave} disabled={saving} className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                      {saved ? "Saved ✓" : saving ? "Saving..." : "Save Script"}
                    </button>
                    <button onClick={async () => {
                      const res = await fetch(`/api/export/${initialSession.id}`);
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${initialSession.verticalName.replace(/\s+/g, "-")}-script.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }} className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                      Download as Text
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}