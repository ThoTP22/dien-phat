import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export interface UploadedFile {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  key: string;
  url: string;
}

export async function uploadImages(
  files: File[],
  folder?: string
): Promise<UploadedFile[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (folder) formData.append("folder", folder);

  // Không set Content-Type thủ công để axios tự gắn boundary đúng
  const res = await adminHttp.post(apiEndpoints.uploads.images, formData);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Upload ảnh thất bại");
  }
  return res.data.data.files as UploadedFile[];
}
