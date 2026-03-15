import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../configs/s3";
import { env } from "../configs/env";

export function extractS3KeyFromUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If it's already a key (no protocol), assume it's the key
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed.replace(/^\/+/, "");
  }

  try {
    const u = new URL(trimmed);
    // works for virtual-hosted–style: https://bucket.s3.region.amazonaws.com/key
    const key = u.pathname.replace(/^\/+/, "");
    return key || null;
  } catch {
    return null;
  }
}

export async function presignPublicGetObjectUrl(input: {
  urlOrKey: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const key = extractS3KeyFromUrl(input.urlOrKey);
  if (!key) return input.urlOrKey;

  const command = new GetObjectCommand({
    Bucket: env.s3BucketName,
    Key: key
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 60
  });
}

