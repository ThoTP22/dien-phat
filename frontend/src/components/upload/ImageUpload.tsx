"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import Uploady, { useUploady } from "@rpldy/uploady";
import { UploadPreview } from "@rpldy/upload-preview";
import { createCustomSend } from "@/lib/uploady-sender";
import type { UploadedFile } from "@/services/upload.service";
import { Button } from "@/components/ui/button";

export interface ImageUploadProps {
  folder?: string;
  onUploadComplete: (files: UploadedFile[]) => void;
  onError?: (message: string) => void;
  multiple?: boolean;
  accept?: string;
  children?: React.ReactNode;
  className?: string;
}

function ImageUploadInner({
  folder = "products",
  onUploadComplete,
  multiple = true,
  accept = "image/*",
  className,
}: ImageUploadProps) {
  const { showFileUpload, upload } = useUploady();

  const handleClick = useCallback(() => {
    showFileUpload();
  }, [showFileUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files?.length) {
        const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (fileArray.length) {
          upload(fileArray);
        }
      }
    },
    [upload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-center transition-colors hover:border-primary/50 hover:bg-zinc-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="text-sm font-medium text-zinc-600">Kéo thả ảnh vào đây hoặc bấm để chọn</p>
        <p className="mt-1 text-xs text-zinc-500">Hỗ trợ nhiều ảnh, định dạng ảnh thông dụng</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Chọn ảnh
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <UploadPreview
          rememberPreviousBatches
          loadFirstOnly={false}
          previewComponentProps={{
            style: { width: 80, height: 80, objectFit: "cover", borderRadius: 4, border: "1px solid #e4e4e7" },
          }}
        />
      </div>
    </div>
  );
}

export function ImageUpload(props: ImageUploadProps) {
  const { folder = "products", onUploadComplete, onError, multiple = true, accept = "image/*" } = props;
  const onSuccessRef = useRef(onUploadComplete);
  useEffect(() => {
    onSuccessRef.current = onUploadComplete;
  }, [onUploadComplete]);

  const send = useMemo(
    () =>
      createCustomSend({
        folder,
        onSuccess: (files) => {
          onSuccessRef.current?.(files as UploadedFile[]);
        },
        onError,
      }),
    [folder, onError]
  );

  return (
    <Uploady
      destination={{ url: "" }}
      send={send}
      multiple={multiple}
      accept={accept}
      inputFieldName="files"
      fileInputId="image-upload-input"
      grouped
      maxGroupSize={10}
    >
      <ImageUploadInner {...props} />
    </Uploady>
  );
}
