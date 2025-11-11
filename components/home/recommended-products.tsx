"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { ProductItem } from "@/components/product-item";
import { RecommendedProduct } from "@/modules/home/types";

export default function RecommendedProducts() {
  const trpc = useTRPC();
  const { data: products, isLoading } = useQuery(
    trpc.home.getRecommendedProducts.queryOptions()
  );

  return (
    <section className="bg-background">
      <div className="container px-8">
        <div className="mb-8 text-start">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Recommended Products
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore our latest and greatest products
          </p>
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products && products.length > 0 ? (
              (products || []).map((product: RecommendedProduct) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading="lazy"
                />
              ))
            ) : (
              <div className="col-span-full rounded-lg border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  No products available at the moment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-lg border bg-card"
        >
          <Skeleton className="aspect-square w-full" />
          <div className="p-4">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
