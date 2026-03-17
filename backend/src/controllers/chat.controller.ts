import type { Request, Response } from "express";
import { z } from "zod";
import { GeminiService } from "../services/gemini.service";
import { executeTool } from "../chat/tools";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000)
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20)
});

function totalChars(messages: Array<{ content: string }>) {
  return messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
}

function parseBtu(text: string): string | undefined {
  const m = text.match(/(\d{4,5})\s*(btu)?/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  if ([9000, 12000, 18000, 24000].includes(n)) return String(n);
  return undefined;
}

function wantsProducts(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("máy lạnh") ||
    t.includes("điều hòa") ||
    t.includes("dieu hoa") ||
    t.includes("inverter") ||
    t.includes("btu") ||
    /\d+\s*m2/.test(t) ||
    t.includes("gợi ý") ||
    t.includes("tư vấn")
  );
}

export const chatHandler = async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Chatbot chưa được cấu hình (thiếu GEMINI_API_KEY)"
      });
    }

    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Payload không hợp lệ",
        errors: parsed.error.flatten()
      });
    }

    const { messages } = parsed.data;
    if (totalChars(messages) > 12000) {
      return res.status(413).json({
        success: false,
        message: "Nội dung quá dài"
      });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    let suggestions: Array<{ name: string; slug: string; shortDescription?: string; imageUrl?: string }> = [];
    if (wantsProducts(lastUser)) {
      const capacityBtu = parseBtu(lastUser);
      const technology = lastUser.toLowerCase().includes("inverter") ? "inverter" : undefined;
      const toolRes = await executeTool({
        name: "searchProducts",
        args: {
          search: "midea",
          limit: 6,
          capacityBtu,
          technology
        }
      });
      if (toolRes.ok) {
        const items = (toolRes.data as any)?.items;
        if (Array.isArray(items)) {
          suggestions = items.slice(0, 2).map((p: any) => ({
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription,
            imageUrl: p.imageUrl
          }));
        }
      }
    }

    const systemInstructionText = [
      "Bạn là chatbot tư vấn của showroom Gold Shop Midea Điện Phát.",
      "Trả lời bằng tiếng Việt, ngắn gọn, lịch sự.",
      "Khi cần thông tin thực tế về sản phẩm/danh mục/showroom/bài viết, hãy dùng tool đã cung cấp.",
      "Không bịa giá/khuyến mãi/địa chỉ nếu tool không trả về.",
      "Nếu thiếu dữ liệu, hỏi lại 1-2 câu để làm rõ nhu cầu (công suất BTU, inverter, phòng bao nhiêu m2...).",
      "Nếu người dùng hỏi về các sản phẩm, hãy sử dụng tool để trả lời.",
      "Chỉ trả lời những vấn đề liên quan đến sản phẩm và showroom.",
      "Không trả lời những vấn đề không liên quan đến sản phẩm và showroom.",
      suggestions.length
        ? `Ưu tiên đề xuất 1-2 sản phẩm bên dưới (đã fetch sẵn) khi phù hợp: ${JSON.stringify(suggestions)}`
        : "Nếu phù hợp, hãy đề xuất 1-2 sản phẩm cụ thể từ tool."
    ].join("\n");

    const svc = new GeminiService();
    const out = await svc.chat({
      messages,
      systemInstructionText
    });

    return res.json({
      success: true,
      message: "OK",
      data: { reply: out.reply, toolTrace: out.toolTrace, suggestions }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({
      success: false,
      message: msg || "Lỗi chatbot"
    });
  }
};

