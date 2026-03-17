"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ChatMsg = { role: "user" | "assistant"; content: string };
type Suggestion = { name: string; slug: string; shortDescription?: string; imageUrl?: string };

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

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

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
        <div className="flex h-[78vh] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:h-[64vh]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="text-sm font-semibold text-zinc-900">Tư vấn nhanh</div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-zinc-100 text-zinc-900"
                  ].join(" ")}
                >
                  {m.content}
                </div>
              ))}

              {suggestions.length ? (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-zinc-700">Gợi ý sản phẩm</div>
                  {suggestions.map((s) => (
                    <a
                      key={s.slug}
                      href={`/san-pham/${s.slug}`}
                      className="block rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50"
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
                    </a>
                  ))}
                </div>
              ) : null}

              {loading ? (
                <div className="mr-auto max-w-[92%] rounded-2xl bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
                  Đang trả lời...
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-zinc-200 p-3">
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
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" disabled={!canSend}>
                Gửi
              </Button>
            </form>
            <div className="mt-2 text-[11px] text-zinc-500">
              Gợi ý: \"inverter 12000BTU\", \"showroom ở đâu\", \"số điện thoại\".
            </div>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={() => setOpen(true)} className="shadow-lg">
          Chat tư vấn
        </Button>
      )}
    </div>
  );
}

