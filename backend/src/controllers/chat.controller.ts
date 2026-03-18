import type { Request, Response } from "express";
import { z } from "zod";
import { GeminiService } from "../services/gemini.service";
import { executeTool } from "../chat/tools";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000)
});

const suggestionSchema = z.object({
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().optional(),
  imageUrl: z.string().optional()
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  context: z
    .object({
      suggestions: z.array(suggestionSchema).max(6).optional()
    })
    .partial()
    .optional()
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

function normalizeTerm(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[?!.:,;()]/g, "");
}

const glossary: Record<string, string> = {
  inverter:
    "Inverter là công nghệ điều khiển máy nén chạy êm và ổn định hơn, giúp tiết kiệm điện khi phòng đã đạt nhiệt độ. Thường phù hợp nếu bạn dùng máy lạnh nhiều giờ mỗi ngày.",
  btu: "BTU là đơn vị công suất làm lạnh. BTU càng cao thì làm mát được phòng càng lớn. Tham khảo nhanh: 9000BTU ~10–15m², 12000BTU ~15–20m², 18000BTU ~20–30m², 24000BTU ~30–40m² (tuỳ nắng, trần cao, số người).",
  hp: "HP (hay 'ngựa') là cách gọi công suất: 1HP ~ 9000BTU, 1.5HP ~ 12000BTU, 2HP ~ 18000BTU, 2.5HP ~ 24000BTU.",
  mono:
    "Mono (non-inverter) là máy không inverter. Giá thường rẻ hơn nhưng có thể tốn điện hơn nếu chạy lâu; máy nén thường bật/tắt theo nhiệt độ.",
  "1 chieu": "Máy lạnh 1 chiều chỉ làm lạnh.",
  "2 chieu": "Máy lạnh 2 chiều có làm lạnh và sưởi (ít dùng ở miền Nam).",
  r32: "R32 là môi chất lạnh phổ biến hiện nay, hiệu suất tốt và thân thiện môi trường hơn so với R410A.",
  r410a: "R410A là môi chất lạnh đời trước, vẫn dùng được nhưng hiện nay nhiều mẫu mới chuyển sang R32.",
  db: "dB là đơn vị độ ồn. dB càng thấp thì máy chạy càng êm (quan trọng với phòng ngủ).",
  "bao hanh":
    "Bảo hành thường tách: bảo hành máy nén và bảo hành linh kiện. Tuỳ model sẽ có thời gian khác nhau."
};

function tryAnswerGlossary(text: string): string | null {
  const t = normalizeTerm(text);
  const has = (k: string) => t.includes(k);

  const answers: string[] = [];
  if (has("inverter")) answers.push(glossary.inverter);
  if (has("btu")) answers.push(glossary.btu);
  if (has("hp") || has("ngua") || has("ngựa")) answers.push(glossary.hp);
  if (has("mono") || has("non inverter") || has("non-inverter")) answers.push(glossary.mono);
  if (has("1 chieu") || has("1 chiều")) answers.push(glossary["1 chieu"]);
  if (has("2 chieu") || has("2 chiều")) answers.push(glossary["2 chieu"]);
  if (has("r32")) answers.push(glossary.r32);
  if (has("r410a") || has("r410")) answers.push(glossary.r410a);
  if (has("db") || has("do on") || has("độ ồn")) answers.push(glossary.db);
  if (has("bao hanh") || has("bảo hành")) answers.push(glossary["bao hanh"]);

  if (!answers.length) return null;
  return answers.join("\n\n");
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

    const { messages, context } = parsed.data;
    const previousSuggestions =
      (Array.isArray(context?.suggestions) ? context?.suggestions : undefined) ?? [];
    if (totalChars(messages) > 12000) {
      return res.status(413).json({
        success: false,
        message: "Nội dung quá dài"
      });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // Trả lời nhanh cho câu hỏi thuật ngữ (không cần Gemini)
    const glossaryAnswer = tryAnswerGlossary(lastUser);
    if (glossaryAnswer) {
      return res.json({
        success: true,
        message: "OK",
        data: { reply: glossaryAnswer, toolTrace: [], suggestions: [] }
      });
    }

    let suggestions: Array<{ name: string; slug: string; shortDescription?: string; imageUrl?: string }> =
      previousSuggestions.slice(0, 2);

    if (!suggestions.length && wantsProducts(lastUser)) {
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

    const isCompare =
      /so sánh/i.test(lastUser) || /so sanh/i.test(lastUser) || /compare/i.test(lastUser);

    const suggestionsForModel = suggestions;

    const systemInstructionText = [
      "Bạn là trợ lý tư vấn của showroom Gold Shop Midea Điện Phát.",
      "Trả lời bằng tiếng Việt, thân thiện, rõ ràng và đúng trọng tâm.",
      "Bạn có thể trả lời rộng hơn về các chủ đề liên quan điều hòa/máy lạnh: thuật ngữ (Inverter/BTU/HP/R32), chọn công suất theo diện tích, cách sử dụng tiết kiệm điện, lưu ý lắp đặt và bảo trì cơ bản.",
      "Khi cần thông tin thực tế của cửa hàng (showroom) hoặc dữ liệu sản phẩm/danh mục/bài viết, hãy dùng tool đã cung cấp.",
      "Không bịa thông tin cụ thể như giá, khuyến mãi, tồn kho, địa chỉ/giờ mở cửa nếu tool không trả về. Nếu không có dữ liệu, hãy nói rõ là chưa có và gợi ý khách xem trang chi tiết hoặc liên hệ showroom.",
      "Nếu câu hỏi chưa đủ dữ kiện để tư vấn (ví dụ diện tích phòng, phòng có nắng, số người, nhu cầu Inverter), hãy hỏi lại tối đa 1–2 câu để làm rõ trước khi đề xuất.",
      suggestionsForModel.length
        ? `Hiện có danh sách sản phẩm gợi ý (name, slug, shortDescription, imageUrl): ${JSON.stringify(
            suggestionsForModel
          )}.`
        : "Nếu phù hợp, hãy dùng tool để tìm và đề xuất 1-2 sản phẩm cụ thể.",
      isCompare && suggestionsForModel.length >= 2
        ? "Nếu người dùng yêu cầu so sánh, hãy so sánh các sản phẩm trong danh sách gợi ý ở trên (không yêu cầu nhập lại mã)."
        : "Nếu người dùng yêu cầu so sánh mà chưa nêu rõ sản phẩm, hãy hỏi lại ngắn gọn để xác định 2 mẫu cần so sánh."
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

