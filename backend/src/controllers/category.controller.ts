import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  CreateCategoryRequestDTO,
  UpdateCategoryRequestDTO
} from "../dto/requests/category.dto";

const categoryService = new CategoryService();

export const listCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.list(req.query as any);

    return res.json({
      success: true,
      message: "Danh sách danh mục",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể lấy danh sách danh mục"
    });
  }
};

export const getCategoryBySlugHandler = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getBySlug(req.params.slug);

    return res.json({
      success: true,
      message: "Chi tiết danh mục",
      data: result
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy danh mục"
    });
  }
};

export const getAdminCategoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAdminById(req.params.id);

    return res.json({
      success: true,
      message: "Chi tiết danh mục (admin)",
      data: result
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy danh mục"
    });
  }
};

export const createCategoryHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as CreateCategoryRequestDTO;

    const result = await categoryService.create(body, req.user?.id);

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Tạo danh mục thất bại"
    });
  }
};

export const updateCategoryHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as UpdateCategoryRequestDTO;

    const result = await categoryService.update(req.params.id, body, req.user?.id);

    return res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật danh mục thất bại"
    });
  }
};

export const deleteCategoryHandler = async (req: AuthRequest, res: Response) => {
  try {
    await categoryService.softDelete(req.params.id);

    return res.json({
      success: true,
      message: "Ẩn danh mục thành công",
      data: {}
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Ẩn danh mục thất bại"
    });
  }
};

