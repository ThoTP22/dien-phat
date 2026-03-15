import { Request, Response } from "express";
import { LeadService } from "../services/lead.service";
import { CreateLeadRequestDTO, UpdateLeadStatusRequestDTO } from "../dto/requests/lead.dto";

const leadService = new LeadService();

export const createLeadHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateLeadRequestDTO;

    const data = await leadService.create(body);

    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu tư vấn thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Gửi yêu cầu tư vấn thất bại"
    });
  }
};

export const listLeadsHandler = async (req: Request, res: Response) => {
  try {
    const data = await leadService.list(req.query as any);

    return res.json({
      success: true,
      message: "Danh sách leads",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể tải danh sách leads"
    });
  }
};

export const getLeadByIdHandler = async (req: Request, res: Response) => {
  try {
    const data = await leadService.getById(req.params.id);

    return res.json({
      success: true,
      message: "Chi tiết lead",
      data
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy lead"
    });
  }
};

export const updateLeadStatusHandler = async (req: Request, res: Response) => {
  try {
    const body = req.body as UpdateLeadStatusRequestDTO;

    const data = await leadService.updateStatus(req.params.id, body);

    return res.json({
      success: true,
      message: "Cập nhật lead thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật lead thất bại"
    });
  }
};

