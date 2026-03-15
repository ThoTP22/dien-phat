"use client";

import { useEffect, useMemo, useState } from "react";

type ImageItem = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
};

type Props = {
  images: ImageItem[] | undefined;
  fallbackAlt: string;
  wrapperClassName?: string;
  imgClassName?: string;
  intervalMs?: number;
};

export function HoverImageCarousel({
  images,
  fallbackAlt,
  wrapperClassName,
  imgClassName,
  intervalMs = 1500,
}: Props) {
  const ordered = useMemo(() => {
    const arr = (images ?? []).filter((img) => img && img.url);
    if (!arr.length) return arr;
    const primaryIndex = arr.findIndex((i) => i.isPrimary);
    if (primaryIndex <= 0) return arr;
    const [primary] = arr.splice(primaryIndex, 1);
    return [primary, ...arr];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || ordered.length <= 1) return;
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % ordered.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [hovered, ordered.length, intervalMs]);

  const current = ordered[activeIndex] ?? ordered[0];

  if (!current) {
    return (
      <div
        className={
          wrapperClassName ??
          "aspect-[4/3] w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50"
        }
      />
    );
  }

  return (
    <div
      className={wrapperClassName}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActiveIndex(0);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt={current.alt || fallbackAlt}
        className={imgClassName}
        loading="lazy"
      />
    </div>
  );
}

