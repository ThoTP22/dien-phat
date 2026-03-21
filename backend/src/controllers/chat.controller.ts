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
      "- Co the tu van chon may theo dien tich, ngan sach, nhu cau su dung ma khong can tool neu la kien thuc chung.",
      "- Khi can du lieu thuc te cua shop (san pham cu the, showroom, bai viet, danh muc), dung tool da cung cap.",
      "- Khi tu van, hay dung searchPosts de tim bai viet lien quan, roi dung getPostBySlug de doc noi dung chi tiet. Trich dan kien thuc tu bai viet de loi khuyen co co so va dan link bai viet cho khach tham khao (vd: 'Theo bai viet [Ten bai](/tin-tuc/slug)...').",
      "",
      "NGUYEN TAC:",
      "- Khong bia thong tin cu the (gia, khuyen mai, ton kho, dia chi) neu tool khong tra ve.",
      "- Neu khong co du lieu, noi ro va goi y khach xem trang chi tiet hoac lien he showroom.",
      "- Khi khach noi 'so sanh' ma da co san pham trong ngu canh, so sanh ngay khong hoi lai.",
      "",
      suggestionsForModel.length
        ? `CONTEXT: Hien co san pham goi y: ${JSON.stringify(suggestionsForModel)}. Hay su dung khi phu hop, dac biet khi khach muon so sanh hoac can tu van cu the.`
        : "Neu phu hop, dung tool tim va de xuat 1-2 san pham cu the.",
      isCompare && suggestionsForModel.length >= 2
        ? "Khach dang muon so sanh. Hay so sanh truc tiep cac san pham trong context, khong hoi lai ma san pham."
        : ""
    ].filter(Boolean).join("\n");

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

