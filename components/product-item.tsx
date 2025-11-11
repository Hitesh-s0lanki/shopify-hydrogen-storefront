"use client";

import Link from "next/link";
import Image from "next/image";
import type { RecommendedProduct } from "@/modules/home/types";
import { formatMoney } from "@/lib/utils";

interface ProductItemProps {
  product: RecommendedProduct;
  loading?: "eager" | "lazy";
}

export function ProductItem({ product, loading = "lazy" }: ProductItemProps) {
  const image = product.featuredImage;
  const productUrl = `/products/${product.handle}`;

  return (
    <Link
      className="group relative flex h-full flex-col overflow-hidden bg-card transition-all duration-300 hover:shadow-md border"
      href={productUrl}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {image?.url ? (
          <>
            <Image
              alt={image.altText || product.title}
              src={image.url}
              width={image.width || 400}
              height={image.height || 400}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Product Title */}
        <h4 className="mb-3 line-clamp-2 min-h-10 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
          {product.title}
        </h4>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2">
          <div className="text-lg font-semibold text-foreground">
            {formatMoney(product.priceRange.minVariantPrice)}
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent transition-colors group-hover:bg-primary" />
    </Link>
  );
}
