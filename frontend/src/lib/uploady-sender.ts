import type { BatchItem, SendOptions, UploadData } from "@rpldy/shared";
import type { SendMethod, OnProgress } from "@rpldy/sender";
import { FILE_STATES } from "@rpldy/shared";
import { apiEndpoints } from "@/lib/api";
import { adminHttp } from "@/lib/admin-http";

export interface CustomSendOptions {
  folder?: string;
  onSuccess?: (files: { url: string; originalName: string }[]) => void;
  onError?: (message: string) => void;
}

function getFilesFromItems(items: BatchItem[]): File[] {
  const files: File[] = [];
  for (const item of items) {
    // BatchItem.file được typing là FileLike nhưng runtime là File/Blob -> cast qua unknown để TS chấp nhận
    const file = (item as unknown as { file?: File | Blob }).file;
    if (file instanceof File) {
      files.push(file);
    } else if (file instanceof Blob && file.type.startsWith("image/")) {
      files.push(new File([file], (file as File & { name?: string }).name ?? "image", { type: file.type }));
    }
  }
  return files;
}

export function createCustomSend(options: CustomSendOptions): SendMethod {
  return function customSend(
    items: BatchItem[],
    _url: string | undefined,
    sendOptions: SendOptions,
    onProgress?: OnProgress
  ) {
    const files = getFilesFromItems(items);
    if (files.length === 0) {
      return {
        request: Promise.resolve({
          status: 400,
          state: FILE_STATES.ERROR,
          response: { message: "Không có file hợp lệ" },
        }),
        abort: () => false,
        senderType: "custom-api",
      };
    }

    const folder = options.folder ?? (sendOptions.params?.folder as string) ?? "products";
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("folder", folder);

    const controller = new AbortController();
    const request = adminHttp
      .post(apiEndpoints.uploads.images, formData, {
        signal: controller.signal,
        onUploadProgress: (e) => {
          if (e.total != null && onProgress) {
            onProgress(
              { loaded: e.loaded, total: e.total },
              items.map((item) => ({ item }))
            );
          }
        },
      })
      .then((res) => {
        const data = res.data;
        const rawFiles = data?.data?.files;
        const isArray = Array.isArray(rawFiles);
        if (!data?.success || (!isArray && !rawFiles)) {
          const msg = data?.message || "Upload thất bại";
          options.onError?.(msg);
          return {
            status: res.status || 500,
            state: FILE_STATES.ERROR,
            response: msg,
          } as UploadData;
        }
        const uploadedFiles = isArray ? rawFiles : [rawFiles];
        const normalized = uploadedFiles.map((f: unknown) => {
          const o = f as Record<string, unknown>;
          return {
            url: String(o?.url ?? ""),
            originalName: String(o?.originalName ?? o?.originalname ?? ""),
          };
        }).filter((f) => f.url.length > 0);
        if (normalized.length > 0) {
          options.onSuccess?.([...normalized]);
        }
        return {
          status: res.status,
          state: FILE_STATES.FINISHED,
          response: data,
        } as UploadData;
      })
      .catch((err) => {
        const status = err.response?.status ?? 500;
        const message = err.response?.data?.message ?? err.message ?? "Upload thất bại";
        options.onError?.(message);
        return {
          status,
          state: FILE_STATES.ERROR,
          response: { message },
        } as UploadData;
      });

    return {
      request,
      abort: () => {
        controller.abort();
        return true;
      },
      senderType: "custom-api",
    };
  };
}
