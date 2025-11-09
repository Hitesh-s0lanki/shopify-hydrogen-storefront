import {Suspense} from 'react';
import {Await} from 'react-router';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Skeleton} from '~/components/ui/skeleton';

interface RecommendedProductsProps {
  products: Promise<RecommendedProductsQuery | null>;
}

export function RecommendedProducts({products}: RecommendedProductsProps) {
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

        <Suspense fallback={<ProductGridSkeleton />}>
          <Await resolve={products}>
            {(response) => (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {response?.products.nodes &&
                response.products.nodes.length > 0 ? (
                  response.products.nodes.map((product) => (
                    <div
                      key={product.id}
                      className="group relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                    >
                      <ProductItem product={product} loading="lazy" />
                    </div>
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
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({length: 4}, (_, i) => `skeleton-${i}`).map((key) => (
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
