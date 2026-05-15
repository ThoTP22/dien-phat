import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ReviewModel } from "../models/Review";

// GET /api/v1/reviews  (public, chỉ approved)
export const listPublicReviewsHandler = async (req: Request, res: Response) => {
  try {
    const { productSlug, limit = "10", page = "1" } = req.query as Record<string, string>;
    const query: Record<string, unknown> = { isApproved: true };
    if (productSlug) query.productSlug = productSlug;

    const limitN = Math.min(Number(limit) || 10, 50);
    const pageN = Math.max(Number(page) || 1, 1);
    const skip = (pageN - 1) * limitN;

    const [items, total] = await Promise.all([
      ReviewModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitN).lean(),
      ReviewModel.countDocuments(query),
    ]);

    return res.json({ success: true, message: "Đánh giá", data: { items, total, page: pageN, limit: limitN } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/v1/reviews  (public, submit đánh giá)
export const createReviewHandler = async (req: Request, res: Response) => {
  try {
    const { customerName, rating, comment, productSlug } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: "customerName, rating và comment là bắt buộc" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "rating phải từ 1 đến 5" });
    }
    const review = await ReviewModel.create({
      customerName,
      rating: Number(rating),
      comment,
      productSlug: productSlug || undefined,
      isApproved: false, // chờ admin duyệt
    });
    return res.status(201).json({ success: true, message: "Đánh giá của bạn đã được ghi nhận, chờ duyệt", data: review });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/v1/admin/reviews
export const listAdminReviewsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = "20", page = "1", approved } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};
    if (approved === "true") query.isApproved = true;
    if (approved === "false") query.isApproved = false;

    const limitN = Math.min(Number(limit) || 20, 100);
    const pageN = Math.max(Number(page) || 1, 1);
    const skip = (pageN - 1) * limitN;

    const [items, total] = await Promise.all([
      ReviewModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitN).lean(),
      ReviewModel.countDocuments(query),
    ]);

    return res.json({ success: true, message: "Danh sách đánh giá (admin)", data: { items, total, page: pageN, limit: limitN } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/v1/admin/reviews/:id  (approve / reject)
export const updateReviewHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { isApproved } = req.body;
    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: Boolean(isApproved) } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    return res.json({ success: true, message: "Cập nhật đánh giá thành công", data: review });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/v1/admin/reviews/:id
export const deleteReviewHandler = async (req: AuthRequest, res: Response) => {
  try {
    await ReviewModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Xóa đánh giá thành công", data: {} });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
