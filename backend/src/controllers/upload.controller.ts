import { Request, Response } from "express";
import { UploadService } from "../services/upload.service";

const uploadService = new UploadService();

export const uploadImagesHandler = async (req: Request, res: Response) => {
  // middleware uploadImages dùng multer.array("files") nên req.files luôn là mảng
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const { folder } = req.body as { folder?: string; entityType?: string; entityId?: string };

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Không có file nào được upload"
    });
  }

  try {
    const uploadedFiles = await uploadService.uploadImages({
      files,
      folder
    });

    return res.status(201).json({
      success: true,
      message: "Upload thành công",
      data: {
        files: uploadedFiles
      }
    });
  } catch (error: any) {
    console.error("Upload images failed", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Upload thất bại"
    });
  }
};

