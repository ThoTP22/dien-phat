"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ChatMsg = { role: "user" | "assistant"; content: string };
type Suggestion = { name: string; slug: string; shortDescription?: string; imageUrl?: string };

type PersistedState = {
  v: 1;
  open: boolean;
  messages: ChatMsg[];
  suggestions: Suggestion[];
  lastSentAt?: number;
};

const LS_KEY = "dp_chat_state_v1";
const CLEAR_AFTER_MS = 2 * 60 * 1000;

function clamp(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "Chào bạn, mình có thể hỗ trợ tư vấn sản phẩm, showroom và tin tức. Bạn cần hỏi gì ạ?"
    }
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const lastSentAtRef = useRef<number | undefined>(undefined);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);
  const launcherText = "Trợ lý AI sẵn sàng tư vấn miễn phí";

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed?.v !== 1) return;
      if (Array.isArray(parsed.messages) && parsed.messages.length) setMessages(parsed.messages);
      if (Array.isArray(parsed.suggestions)) setSuggestions(parsed.suggestions.slice(0, 2));
      if (typeof parsed.open === "boolean") setOpen(parsed.open);
      if (typeof parsed.lastSentAt === "number") lastSentAtRef.current = parsed.lastSentAt;
    } catch {
      // ignore
    }
  }, []);

  // persist to localStorage on changes
  useEffect(() => {
    try {
      const state: PersistedState = {
        v: 1,
        open,
        messages,
        suggestions,
        lastSentAt: lastSentAtRef.current
      };
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [open, messages, suggestions]);

  function scheduleClear(lastSentAt: number) {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    clearTimerRef.current = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed?.lastSentAt !== lastSentAt) return; // đã có tin nhắn mới
        localStorage.removeItem(LS_KEY);
      } catch {
        // ignore
      }
    }, CLEAR_AFTER_MS);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");
    const nextMessages: ChatMsg[] = [...messages, { role: "user", content: clamp(text, 1000) }];
    setMessages(nextMessages);
    setLoading(true);
    setSuggestions([]);

    try {
      const sentAt = Date.now();
      lastSentAtRef.current = sentAt;
      scheduleClear(sentAt);

      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Không thể gửi tin nhắn");
      }
      const reply = (json?.data?.reply || "").toString().trim();
      const sug = Array.isArray(json?.data?.suggestions) ? (json.data.suggestions as Suggestion[]) : [];
      setMessages((prev) => [...prev, { role: "assistant", content: reply || "Mình chưa có đủ thông tin để trả lời." }]);
      setSuggestions(sug.slice(0, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="flex h-[78vh] w-[94vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl sm:h-[64vh]">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Trợ lý AI</div>
              <div className="text-[11px] text-white/80">{launcherText}</div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/15"
            >
              Đóng
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto bg-zinc-50 px-3 py-3">
            <div className="space-y-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    "max-w-[92%] rounded-3xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-white text-zinc-900 border border-zinc-200"
                  ].join(" ")}
                >
                  {m.content}
                </div>
              ))}

              {suggestions.length ? (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-zinc-700">Gợi ý sản phẩm</div>
                  {suggestions.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/san-pham/${s.slug}`}
                      className="block rounded-2xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 shadow-sm"
                    >
                      <div className="flex gap-2">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="h-12 w-12 shrink-0 rounded-md border border-zinc-200 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-md border border-zinc-200 bg-zinc-100" />
                        )}
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-sm font-semibold text-zinc-900">{s.name}</div>
                          {s.shortDescription ? (
                            <div className="line-clamp-2 text-xs text-zinc-600">{s.shortDescription}</div>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}

              {loading ? (
                <div className="mr-auto max-w-[92%] rounded-3xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 shadow-sm">
                  Đang trả lời...
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white p-3">
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" disabled={!canSend}>
                Gửi
              </Button>
            </form>
            <div className="mt-2 text-[11px] text-zinc-500">
              Gợi ý: Hãy nhập vấn đề của bạn, mình sẽ cung cấp gợi ý phù hợp.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-2">
          <div className="max-w-[240px] rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-md">
            {launcherText}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-xl transition hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-primary/25"
            aria-label="Mở chat tư vấn"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12a8 8 0 0 1 16 0" />
              <path d="M4 12v5a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 1-2-2Z" />
              <path d="M20 12v5a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 0 2-2Z" />
              <path d="M12 19c0 1.5-1.5 2-3 2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

