import type { Request, Response } from "express";
import { z } from "zod";
import { GeminiService } from "../services/gemini.service";

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

    const systemInstructionText = [
      "Bạn là chatbot tư vấn của showroom Gold Shop Midea Điện Phát.",
      "Trả lời bằng tiếng Việt, ngắn gọn, lịch sự.",
      "Khi cần thông tin thực tế về sản phẩm/danh mục/showroom/bài viết, hãy dùng tool đã cung cấp.",
      "Không bịa giá/khuyến mãi/địa chỉ nếu tool không trả về.",
      "Nếu thiếu dữ liệu, hỏi lại 1-2 câu để làm rõ nhu cầu (công suất BTU, inverter, phòng bao nhiêu m2...).",
      "Nếu người dùng hỏi về các sản phẩm, hãy sử dụng tool để trả lời.",
      "Chỉ trả lời những vấn đề liên quan đến sản phẩm và showroom."
    ].join("\n");

    const svc = new GeminiService();
    const out = await svc.chat({
      messages,
      systemInstructionText
    });

    return res.json({
      success: true,
      message: "OK",
      data: { reply: out.reply, toolTrace: out.toolTrace }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({
      success: false,
      message: msg || "Lỗi chatbot"
    });
  }
};

