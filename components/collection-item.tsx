"use client";

import Link from "next/link";
import Image from "next/image";
import type { Collection } from "@/modules/collections/types";

interface CollectionItemProps {
  collection: Collection;
  loading?: "eager" | "lazy";
}

export function CollectionItem({
  collection,
  loading = "lazy",
}: CollectionItemProps) {
  const image = collection.image;
  const collectionUrl = `/collections/${collection.handle}`;

  return (
    <Link
      className="group relative flex h-full flex-col overflow-hidden bg-card transition-all duration-300 hover:shadow-lg"
      href={collectionUrl}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {image?.url ? (
          <>
            <Image
              alt={image.altText || collection.title}
              src={image.url}
              width={image.width || 600}
              height={image.height || 450}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Collection Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Collection Title */}
        <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
          {collection.title}
        </h3>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent transition-colors group-hover:bg-primary" />
    </Link>
  );
}

