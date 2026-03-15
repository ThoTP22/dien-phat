"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
};

export function HeroVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: number | undefined;

    const handleEnded = () => {
      timeoutId = window.setTimeout(() => {
        el.play().catch(() => {
          // ignore autoplay block
        });
      }, 10000);
    };

    el.addEventListener("ended", handleEnded);

    // đảm bảo autoplay lần đầu
    el.play().catch(() => {
      // ignore nếu trình duyệt chặn
    });

    return () => {
      el.removeEventListener("ended", handleEnded);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      playsInline
      preload="metadata"
    />
  );
}

