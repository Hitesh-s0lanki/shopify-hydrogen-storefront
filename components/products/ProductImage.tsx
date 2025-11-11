"use client";

import Image from "next/image";
import type { Image as ImageType } from "@/modules/products/types";

interface ProductImageProps {
  image: ImageType | null | undefined;
  alt?: string;
  priority?: boolean;
}

export function ProductImage({
  image,
  alt = "Product Image",
  priority = false,
}: ProductImageProps) {
  if (!image?.url) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm text-muted-foreground">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
      <Image
        alt={image.altText || alt}
        src={image.url}
        width={300}
        height={300}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
