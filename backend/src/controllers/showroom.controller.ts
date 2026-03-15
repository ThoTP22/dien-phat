import { Request, Response } from "express";
import { ShowroomService } from "../services/showroom.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { UpsertShowroomRequestDTO } from "../dto/requests/showroom.dto";

const showroomService = new ShowroomService();

export const getPublicShowroomHandler = async (_req: Request, res: Response) => {
  try {
    const data = await showroomService.getPublicShowroom();

    return res.json({
      success: true,
      message: "Showroom fetched",
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tải thông tin showroom"
    });
  }
};

export const getAdminShowroomHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const data = await showroomService.getAdminShowroom();

    return res.json({
      success: true,
      message: "Showroom (admin) fetched",
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tải thông tin showroom"
    });
  }
};

export const upsertShowroomHandler = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as UpsertShowroomRequestDTO;

    const data = await showroomService.upsertShowroom(body, req.user?.id);

    return res.json({
      success: true,
      message: "Cập nhật showroom thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật showroom thất bại"
    });
  }
};

