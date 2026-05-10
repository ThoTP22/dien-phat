"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/lib/use-admin-token";
import { apiEndpoints } from "@/lib/api";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ToolTrace {
  tool: string;
  result?: {
    ok?: boolean;
    data?: {
      id?: string;
      ticketNumber?: string;
      customerName?: string;
      customerPhone?: string;
      faultDescription?: string;
      status?: string;
    };
    error?: string;
  };
}

async function sendAdminChat(
  token: string,
  messages: Message[]
): Promise<{ reply: string; toolTrace: ToolTrace[] }> {
  const res = await fetch(apiEndpoints.chat.admin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Lỗi gửi tin nhắn");
  }
  return json.data;
}

function TicketCreatedBadge({ trace }: Readonly<{ trace: ToolTrace }>) {
  const d = trace.result?.data;
  if (!d?.ticketNumber) return null;
  const href = d.id ? `/admin/bao-hanh/${d.id}` : "/admin/bao-hanh";
  return (
    <Link
      href={href}
      className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 hover:bg-green-100"
    >
      <span className="font-semibold">✓ Phiếu {d.ticketNumber} đã tạo</span>
      {d.customerName && <span>— {d.customerName}</span>}
      {d.customerPhone && <span>({d.customerPhone})</span>}
      <span className="ml-auto text-xs text-green-600 underline">Xem phiếu →</span>
    </Link>
  );
}

export default function AdminChatPage() {
  const token = useAdminToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [traceMap, setTraceMap] = useState<Record<string, ToolTrace[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || !token) return;

    const newMessages: Message[] = [...messages, { id: `u-${Date.now()}`, role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const { reply, toolTrace } = await sendAdminChat(token, newMessages);
      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: reply }]);
      if (toolTrace?.length) {
        setTraceMap((prev) => ({ ...prev, [assistantId]: toolTrace }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages([]);
    setTraceMap({});
    setError("");
    setInput("");
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Chat AI — Tạo phiếu nhanh</h1>
          <p className="text-sm text-zinc-500">
            Nhắn mô tả khách hàng và hư hỏng, AI sẽ tự tạo phiếu sửa chữa.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            Cuộc trò chuyện mới
          </Button>
        )}
      </div>

      {/* Message list */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-zinc-400">
            <div className="text-4xl">💬</div>
            <p className="max-w-sm">
              Ví dụ: <span className="italic text-zinc-500">"tạo phiếu cho khách Nguyễn Văn A số 0901234567, máy lạnh Midea 12000BTU bị hở gas, tại nhà quận Bình Thạnh"</span>
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={[
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-800 shadow-sm",
              ].join(" ")}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {msg.content}
            </div>

            {/* Ticket badge if this is assistant message with a ticket trace */}
            {msg.role === "assistant" &&
              traceMap[msg.id]?.map((trace) =>
                trace.tool === "createRepairTicket" && trace.result?.ok ? (
                  <TicketCreatedBadge key={`${msg.id}-ticket`} trace={trace} />
                ) : null
              )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-400 shadow-sm">
              <span className="animate-pulse">AI đang xử lý...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder='Ví dụ: "tạo phiếu cho khách Trần Thị B số 0912345678, tủ lạnh Samsung bị không làm lạnh"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="flex-1 resize-none text-sm"
          disabled={loading || !token}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim() || !token}
          className="self-end px-5"
        >
          {loading ? "Đang gửi..." : "Gửi"}
        </Button>
      </div>
      <p className="text-xs text-zinc-400">Enter để gửi · Shift+Enter xuống dòng</p>
    </div>
  );
}
