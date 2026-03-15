import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { CreatePostRequestDTO, UpdatePostRequestDTO } from "../dto/requests/post.dto";

const postService = new PostService();

export const listPublicPostsHandler = async (req: Request, res: Response) => {
  try {
    const data = await postService.listPublic(req.query as any);
    return res.json({
      success: true,
      message: "Danh sách bài viết",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể tải danh sách bài viết"
    });
  }
};

export const getPublicPostBySlugHandler = async (req: Request, res: Response) => {
  try {
    const data = await postService.getPublicBySlug(req.params.slug);
    return res.json({
      success: true,
      message: "Chi tiết bài viết",
      data
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy bài viết"
    });
  }
};

export const getAdminPostByIdHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await postService.getAdminById(req.params.id);
    return res.json({
      success: true,
      message: "Chi tiết bài viết (admin)",
      data
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy bài viết"
    });
  }
};

export const createPostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as CreatePostRequestDTO;
    const data = await postService.create(body, req.user?.id);
    return res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Tạo bài viết thất bại"
    });
  }
};

export const updatePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as UpdatePostRequestDTO;
    const data = await postService.update(req.params.id, body, req.user?.id);
    return res.json({
      success: true,
      message: "Cập nhật bài viết thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật bài viết thất bại"
    });
  }
};

export const deletePostHandler = async (req: AuthRequest, res: Response) => {
  try {
    await postService.softDelete(req.params.id);
    return res.json({
      success: true,
      message: "Ẩn bài viết thành công",
      data: {}
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Ẩn bài viết thất bại"
    });
  }
};

