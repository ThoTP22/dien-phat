import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  CreateProductRequestDTO,
  UpdateProductRequestDTO
} from "../dto/requests/product.dto";

const productService = new ProductService();

export const listProductsHandler = async (req: Request, res: Response) => {
  try {
    const result = await productService.list(req.query as any);

    return res.json({
      success: true,
      message: "Danh sách sản phẩm",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể lấy danh sách sản phẩm"
    });
  }
};

export const listProductSegmentsHandler = async (_req: Request, res: Response) => {
  try {
    const segments = await productService.listSegments();

    return res.json({
      success: true,
      message: "Danh sách segment (series) sản phẩm",
      data: segments
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể lấy danh sách segment"
    });
  }
};

export const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const result = await productService.getBySlug(req.params.slug);

    return res.json({
      success: true,
      message: "Chi tiết sản phẩm",
      data: result
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy sản phẩm"
    });
  }
};

export const getAdminProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const result = await productService.getAdminById(req.params.id);

    return res.json({
      success: true,
      message: "Chi tiết sản phẩm (admin)",
      data: result
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy sản phẩm"
    });
  }
};

export const createProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as CreateProductRequestDTO;

    const result = await productService.create(body, req.user?.id);

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Tạo sản phẩm thất bại"
    });
  }
};

export const updateProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as UpdateProductRequestDTO;

    const result = await productService.update(req.params.id, body, req.user?.id);

    return res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật sản phẩm thất bại"
    });
  }
};

export const deleteProductHandler = async (req: AuthRequest, res: Response) => {
  try {
    await productService.softDelete(req.params.id);

    return res.json({
      success: true,
      message: "Ẩn sản phẩm thành công",
      data: {}
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Ẩn sản phẩm thất bại"
    });
  }
};

