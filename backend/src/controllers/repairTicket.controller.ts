import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RepairTicketService } from "../services/repairTicket.service";

const repairTicketService = new RepairTicketService();

export const listRepairTicketsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await repairTicketService.list(req.query as any);
    return res.json({ success: true, message: "Danh sách phiếu bảo hành", data });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể tải danh sách phiếu bảo hành"
    });
  }
};

export const getRepairTicketByIdHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await repairTicketService.getById(req.params.id);
    return res.json({ success: true, message: "Chi tiết phiếu bảo hành", data });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy phiếu bảo hành"
    });
  }
};

export const createRepairTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await repairTicketService.create(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Tạo phiếu bảo hành thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Tạo phiếu bảo hành thất bại"
    });
  }
};

export const updateRepairTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await repairTicketService.update(req.params.id, req.body, req.user);
    return res.json({
      success: true,
      message: "Cập nhật phiếu bảo hành thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật phiếu bảo hành thất bại"
    });
  }
};

export const deleteRepairTicketHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await repairTicketService.delete(req.params.id);
    return res.json({
      success: true,
      message: "Xóa phiếu bảo hành thành công",
      data
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Xóa phiếu bảo hành thất bại"
    });
  }
};

export const getTicketLogsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await repairTicketService.getLogs(req.params.id);
    return res.json({ success: true, message: "Lịch sử phiếu", data: logs });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: error.message || "Không thể tải lịch sử" });
  }
};

export const exportRepairTicketsCsvHandler = async (req: AuthRequest, res: Response) => {
  try {
    const csv = await repairTicketService.exportCsv(req.query as any);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="phieu-bao-hanh-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Xuất dữ liệu thất bại" });
  }
};
