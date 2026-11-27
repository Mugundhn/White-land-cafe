"use client";
import * as React from "react";

/** Product photo that falls back to the WL placeholder if the image is missing or fails to load. */
export function Thumb({ src, alt, lazy = true }: { src: string; alt: string; lazy?: boolean }) {
  const [bad, setBad] = React.useState(false);
  if (!src || bad) return <div className="ph" aria-hidden="true">WL</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={lazy ? "lazy" : undefined} decoding="async" onError={() => setBad(true)} />;
}
