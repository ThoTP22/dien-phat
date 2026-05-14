"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export function SafeImage({ src, fallbackSrc = "/placeholder.webp", alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  const imgSrc = (!src || error) ? fallbackSrc : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt || "Image"}
      onError={() => setError(true)}
      {...props}
    />
  );
}
