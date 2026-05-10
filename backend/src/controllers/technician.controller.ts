import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RepairTicketService } from "../services/repairTicket.service";
import { findRepairTicketById } from "../repositories/repairTicket.repository";
import { findTicketLogs } from "../repositories/ticketLog.repository";

const repairTicketService = new RepairTicketService();

export const listMyTicketsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    const data = await repairTicketService.list({
      technicianId: userId,
      status: req.query.status as string | undefined,
      page: Number(req.query.page) > 0 ? Number(req.query.page) : 1,
      limit: Number(req.query.limit) > 0 ? Number(req.query.limit) : 30
    });
    return res.json({ success: true, message: "Danh sách phiếu của tôi", data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(400).json({ success: false, message });
  }
};

export const getMyTicketByIdHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    const ticket = await findRepairTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" });
    }
    const techId = (ticket.technician as any)?._id?.toString() ?? ticket.technician?.toString();
    if (techId !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem phiếu này" });
    }
    const data = await repairTicketService.getById(req.params.id);
    return res.json({ success: true, message: "Chi tiết phiếu", data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(400).json({ success: false, message });
  }
};

export const updateMyTicketStatusHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    const ticket = await findRepairTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" });
    }
    const techId2 = (ticket.technician as any)?._id?.toString() ?? ticket.technician?.toString();
    if (techId2 !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật phiếu này" });
    }
    const { status, internalNote } = req.body;
    const updated = await repairTicketService.update(req.params.id, { status, internalNote });
    return res.json({ success: true, message: "Cập nhật trạng thái thành công", data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(400).json({ success: false, message });
  }
};

export const updateMyTicketImagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    const ticket = await findRepairTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" });
    }
    const techId = (ticket.technician as any)?._id?.toString() ?? ticket.technician?.toString();
    if (techId !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật phiếu này" });
    }
    const { status, images } = req.body;
    if (!status || typeof status !== "string") {
      return res.status(400).json({ success: false, message: "status là bắt buộc" });
    }
    if (!Array.isArray(images)) {
      return res.status(400).json({ success: false, message: "images phải là mảng" });
    }
    const updated = await repairTicketService.updateStatusImages(req.params.id, status, images, req.user);
    return res.json({ success: true, message: "Cập nhật ảnh thành công", data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(400).json({ success: false, message });
  }
};

export const getMyTicketLogsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    const ticket = await findRepairTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" });
    }
    const techId = (ticket.technician as any)?._id?.toString() ?? ticket.technician?.toString();
    if (techId !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem phiếu này" });
    }
    const logs = await findTicketLogs(req.params.id);
    return res.json({ success: true, message: "Lịch sử thay đổi", data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(400).json({ success: false, message });
  }
};
