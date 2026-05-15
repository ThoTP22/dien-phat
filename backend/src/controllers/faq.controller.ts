import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { FaqModel } from "../models/Faq";

// GET /api/v1/faqs  (public)
export const listPublicFaqsHandler = async (_req: Request, res: Response) => {
  try {
    const faqs = await FaqModel.find({ isVisible: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, message: "Danh sách FAQ", data: faqs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/faqs  (admin)
export const listAdminFaqsHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const faqs = await FaqModel.find({})
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json({ success: true, message: "Danh sách FAQ (admin)", data: faqs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/admin/faqs
export const createFaqHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, category, sortOrder, isVisible } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: "question và answer là bắt buộc" });
    }
    const faq = await FaqModel.create({
      question,
      answer,
      category: category || "",
      sortOrder: sortOrder ?? 0,
      isVisible: isVisible ?? true,
    });
    return res.status(201).json({ success: true, message: "Tạo FAQ thành công", data: faq });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/faqs/:id
export const updateFaqHandler = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FaqModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ success: false, message: "Không tìm thấy FAQ" });
    return res.json({ success: true, message: "Cập nhật FAQ thành công", data: faq });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/faqs/:id
export const deleteFaqHandler = async (req: AuthRequest, res: Response) => {
  try {
    await FaqModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Xóa FAQ thành công", data: {} });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
