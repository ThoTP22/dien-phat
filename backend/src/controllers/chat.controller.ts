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

function isProductIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /(mua|chon|chọn|goi y|gợi ý|tu van|tư vấn|so sanh|so sánh|model|ma may|mã máy|cong suat|công suất|phong|phòng|btu|hp|inverter|gia|giá|san pham|sản phẩm|may lanh|máy lạnh|dieu hoa|điều hòa)/i.test(
    t
  );
}

function isKnowledgeIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /(lưu ý|luu y|kinh nghiệm|kinh nghiem|cách|cach|hướng dẫn|huong dan|nên|nen|là gì|la gi|mẹo|meo)/i.test(
    t
  );
}

function buildPostSearchQuery(text: string): string {
  const t = text
    .toLowerCase()
    .replace(/[?!.:,;()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/(lưu ý|luu y)/i.test(t) && /(mua|chon|chọn)/i.test(t) && /(máy lạnh|may lanh|điều hòa|dieu hoa)/i.test(t)) {
    return "lưu ý mua điều hòa";
  }
  if (/(tiết kiệm điện|tiet kiem dien)/i.test(t)) return "tiết kiệm điện điều hòa";
  if (/(công suất|cong suat|btu|hp)/i.test(t)) return "chọn công suất điều hòa";
  return t;
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
    const productIntent = isProductIntent(lastUser);
    const knowledgeIntent = isKnowledgeIntent(lastUser);

    const isCompare =
      /so sánh|so sanh|compare/i.test(lastUser);

    const systemInstructionText = [
      "Ban la tro ly tu van cua showroom Gold Shop Midea Dien Phat.",
      "",
      "PHONG CACH:",
      "- Noi chuyen nhu mot nguoi ban hieu biet ve dieu hoa, khong phai robot doc tai lieu.",
      "- Tra loi ngan gon, di thang vao van de. Khong lap lai cau hoi cua khach.",
      "- Khi khach hoi don gian, tra loi ngay. Chi hoi lai khi that su thieu thong tin quan trong (dien tich, nhu cau cu the).",
      "- Dung markdown de format: **in dam** cho diem nhan, bullet list khi so sanh hoac liet ke.",
      "",
      "KHA NANG:",
      "- Am hieu sau ve dieu hoa/may lanh: cong nghe (Inverter, non-inverter), cong suat (BTU/HP), gas lanh (R32/R410A), do on, tiet kiem dien, lap dat, bao tri.",
      "- Co the tu van tu do theo ngu canh hoi thoai. Tu chu quyet dinh khi nao can goi tool de xac minh thong tin.",
      "- Uu tien tri thuc noi bo khi co san: dung searchPosts + getPostBySlug de tom tat y chinh va dan link bai viet phu hop.",
      "- Chi de xuat san pham cu the khi co dau hieu y dinh mua/so sanh/tu van model; voi cau hoi kien thuc chung thi tap trung giai thich va huong dan.",
      "",
      "NGUYEN TAC:",
      "- KHONG bịa thong tin. Moi du lieu cu the (gia, khuyen mai, ton kho, dia chi, thong so chi tiet) phai dua tren tool hoac noi dung bai viet noi bo.",
      "- Neu thieu du lieu, noi ro muc do chac chan, dat toi da 1-2 cau hoi lam ro hoac goi y cach kiem tra tiep theo.",
      "- Khi khach noi 'so sanh' ma da co san pham trong ngu canh, so sanh ngay khong hoi lai.",
      "",
      previousSuggestions.length
        ? `CONTEXT: San pham da goi y truoc do: ${JSON.stringify(previousSuggestions)}. Hay su dung khi phu hop, dac biet khi khach muon so sanh hoac can tu van cu the.`
        : "",
      isCompare && previousSuggestions.length >= 2
        ? "Khach dang muon so sanh. Hay so sanh truc tiep cac san pham trong context, khong hoi lai ma san pham."
        : ""
    ].filter(Boolean).join("\n");

    const svc = new GeminiService();
    const out = await svc.chat({
      messages,
      systemInstructionText
    });

    let reply = out.reply;
    const isGenericFallback =
      /Mình chưa có đủ thông tin để trả lời/i.test(reply) ||
      /Mình không thể hoàn tất yêu cầu/i.test(reply);

    if (knowledgeIntent && isGenericFallback) {
      reply = `Mình tổng hợp nhanh các lưu ý quan trọng khi mua máy lạnh:\n\n- **Chọn công suất đúng diện tích và mức nắng** để tránh tốn điện hoặc làm mát kém.\n- **Ưu tiên Inverter** nếu dùng nhiều giờ mỗi ngày để tiết kiệm điện lâu dài.\n- **Kiểm tra độ ồn, gas lạnh (R32), bảo hành máy nén và linh kiện**.\n- **Chọn đơn vị lắp đặt chuẩn kỹ thuật** (vị trí dàn nóng/lạnh, ống đồng, thoát nước).\n\nNếu bạn muốn, mình có thể tư vấn nhanh theo diện tích phòng và ngân sách để chốt công suất phù hợp.`;

      const postRes = await executeTool({
        name: "searchPosts",
        args: { search: buildPostSearchQuery(lastUser), limit: 3 }
      });
      if (postRes.ok) {
        const items = (postRes.data as any)?.items;
        if (Array.isArray(items) && items.length) {
          const lines = items
            .slice(0, 3)
            .map(
              (p: any) =>
                `- [${p.title}](/tin-tuc/${p.slug})${p.summary ? `: ${p.summary}` : ""}`
            )
            .join("\n");
          reply += `\n\nBạn có thể tham khảo bài viết nội bộ:\n${lines}`;
        }
      }
    }

    const suggestions = productIntent && !knowledgeIntent && out.productSuggestions.length
      ? out.productSuggestions
      : productIntent && !knowledgeIntent
        ? previousSuggestions.slice(0, 2)
        : [];

    return res.json({
      success: true,
      message: "OK",
      data: { reply, toolTrace: out.toolTrace, suggestions }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTimeout = msg.includes("timeout") || msg.includes("AbortError");
    const isGeminiDown = msg.includes("Gemini") || msg.includes("503") || msg.includes("500");

    const friendlyReply = isTimeout
      ? "Hệ thống đang phản hồi chậm. Bạn vui lòng thử lại sau giây lát hoặc liên hệ showroom để được tư vấn trực tiếp."
      : isGeminiDown
        ? "Trợ lý AI tạm thời gián đoạn. Bạn có thể liên hệ showroom qua số điện thoại hoặc thử lại sau."
        : undefined;

    if (friendlyReply) {
      return res.json({
        success: true,
        message: "OK",
        data: { reply: friendlyReply, toolTrace: [], suggestions: [] }
      });
    }

    return res.status(500).json({
      success: false,
      message: msg || "Lỗi chatbot"
    });
  }
};
