"use client";

import { useMemo, useState } from "react";

type ImageItem = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
};

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ImageItem[];
  productName: string;
}) {
  const sanitized = useMemo(
    () => (images || []).filter((img) => img?.url && String(img.url).trim().length > 0),
    [images]
  );

  const initialIndex = useMemo(() => {
    if (!sanitized.length) return 0;
    const idx = sanitized.findIndex((x) => !!x.isPrimary);
    return idx >= 0 ? idx : 0;
  }, [sanitized]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const active = sanitized[activeIndex];

  if (!sanitized.length) {
    return <div className="aspect-[4/3] w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50" />;
  }

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active.url}
        alt={active.alt || productName}
        className="aspect-[4/3] w-full rounded-md border border-zinc-200 bg-white object-cover"
      />

      {sanitized.length > 1 ? (
        <div className="grid grid-cols-3 gap-2">
          {sanitized.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`thumb-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={[
                  "rounded-md border bg-white text-left transition",
                  isActive ? "border-primary ring-2 ring-primary/20" : "border-zinc-200 hover:border-primary/50",
                ].join(" ")}
                aria-label={`Xem hình ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || productName}
                  className="aspect-video w-full rounded-md object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

