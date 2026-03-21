import { executeTool, toolDeclarations, type ToolCall } from "../chat/tools";

type ChatMessage = { role: "user" | "assistant"; content: string };

type GeminiPart =
  | { text: string }
  | { functionCall: { id?: string; name: string; args: Record<string, any> } }
  | { functionResponse: { id?: string; name: string; response: Record<string, any> } };

type GeminiContent = { role?: "user" | "model"; parts: GeminiPart[] };

type ProductSuggestion = {
  name: string;
  slug: string;
  shortDescription?: string;
  imageUrl?: string;
};

function asRole(role: ChatMessage["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

function clampString(s: unknown, max: number) {
  const t = typeof s === "string" ? s : JSON.stringify(s ?? "");
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

export class GeminiService {
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const key = (process.env.GEMINI_API_KEY || "").trim();
    if (!key) throw new Error("Thiếu GEMINI_API_KEY");
    this.apiKey = key;
    this.model = (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
  }

  private async generate(contents: GeminiContent[], systemInstructionText: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model
    )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const body = {
      systemInstruction: { parts: [{ text: systemInstructionText }] },
      contents,
      tools: [{ functionDeclarations: toolDeclarations }],
      toolConfig: { functionCallingConfig: { mode: "AUTO" } },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw new Error("Gemini phản hồi quá chậm (timeout 15s). Vui lòng thử lại.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (json as any)?.error?.message || res.statusText || "Gemini error";
      throw new Error(msg);
    }
    return json as any;
  }

  async chat(params: {
    messages: ChatMessage[];
    systemInstructionText: string;
    maxToolIterations?: number;
  }): Promise<{
    reply: string;
    toolTrace: Array<{ name: string; ok: boolean }>;
    productSuggestions: ProductSuggestion[];
  }> {
    const toolTrace: Array<{ name: string; ok: boolean }> = [];
    const productSuggestions: ProductSuggestion[] = [];
    const maxToolIterations = Math.max(0, Math.min(6, params.maxToolIterations ?? 4));

    const contents: GeminiContent[] = params.messages.map((m) => ({
      role: asRole(m.role),
      parts: [{ text: m.content }]
    }));

    for (let iter = 0; iter <= maxToolIterations; iter++) {
      const resp = await this.generate(contents, params.systemInstructionText);
      const cand = resp?.candidates?.[0];
      const modelContent = cand?.content as GeminiContent | undefined;
      const parts: GeminiPart[] = (modelContent?.parts || []) as any;

      if (modelContent?.parts?.length) {
        contents.push({ role: "model", parts });
      }

      const functionCalls: ToolCall[] = [];
      for (const p of parts) {
        const fc = (p as any)?.functionCall;
        if (fc?.name) {
          functionCalls.push({ name: fc.name, args: fc.args || {}, id: fc.id });
        }
      }

      if (!functionCalls.length) {
        const text = parts
          .map((p) => (p as any)?.text)
          .filter(Boolean)
          .join("\n")
          .trim();
        return {
          reply: text || "Mình chưa có đủ thông tin để trả lời.",
          toolTrace,
          productSuggestions: productSuggestions.slice(0, 2)
        };
      }

      for (const call of functionCalls) {
        const result = await executeTool(call);
        toolTrace.push({ name: call.name, ok: result.ok });

        if (result.ok && call.name === "searchProducts" && !productSuggestions.length) {
          const items = (result.data as any)?.items;
          if (Array.isArray(items)) {
            for (const p of items.slice(0, 2)) {
              productSuggestions.push({
                name: p.name,
                slug: p.slug,
                shortDescription: p.shortDescription,
                imageUrl: p.imageUrl
              });
            }
          }
        }

        const response = result.ok
          ? { output: result.data }
          : { error: clampString(result.error, 600) };

        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                id: call.id,
                name: call.name,
                response
              }
            }
          ]
        });
      }
    }

    return {
      reply: "Mình không thể hoàn tất yêu cầu ngay lúc này. Bạn thử hỏi ngắn gọn hơn hoặc thử lại sau.",
      toolTrace,
      productSuggestions: productSuggestions.slice(0, 2)
    };
  }
}
