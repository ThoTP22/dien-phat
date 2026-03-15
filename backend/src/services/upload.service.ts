import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../configs/s3";
import { env } from "../configs/env";
import { randomUUID } from "crypto";

interface UploadedFileInfo {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  key: string;
  url: string;
}

interface UploadImagesParams {
  files: Express.Multer.File[];
  folder?: string;
}

export class UploadService {
  async uploadImages({ files, folder }: UploadImagesParams): Promise<UploadedFileInfo[]> {
    const results: UploadedFileInfo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uniquePrefix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
      const safeOriginalName = file.originalname.replace(/\s+/g, "-");
      const fileName = `${uniquePrefix}-${safeOriginalName}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: env.s3BucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      });

      await s3Client.send(command);

      const url = `https://${env.s3BucketName}.s3.${env.s3Region}.amazonaws.com/${key}`;

      results.push({
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: file.size,
        key,
        url
      });
    }

    return results;
  }
}

