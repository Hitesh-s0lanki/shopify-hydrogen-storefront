import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/modules/products/actions";
import { formatMoney } from "@/lib/utils";
import { Package } from "lucide-react";

export const metadata = {
  title: "Products",
  description: "Browse all our products",
};

export default async function ProductsPage() {
  const { products, pageInfo } = await getProducts(20);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Products
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Discover our complete range of products
          </p>
        </div>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <p className="text-sm font-medium text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
              {pageInfo.hasNextPage && " (showing first page)"}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {products.map((product, index) => (
              <ProductListItem
                key={product.id}
                product={product}
                loading={index < 4 ? "eager" : "lazy"}
              />
            ))}
          </div>

          {/* Pagination Info */}
          {pageInfo.hasNextPage && (
            <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                More products available. Pagination coming soon.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No products found.
          </p>
        </div>
      )}
    </div>
  );
}

function ProductListItem({
  product,
  loading,
}: {
  product: {
    id: string;
    title: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    featuredImage?: {
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
    } | null;
  };
  loading?: "eager" | "lazy";
}) {
  const image = product.featuredImage;
  const productUrl = `/products/${product.handle}`;

  return (
    <Link
      className="group relative flex flex-row items-center gap-4 overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      href={productUrl}
    >
      {image && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted md:h-24 md:w-24">
          <Image
            alt={image.altText || product.title}
            src={image.url}
            width={image.width || 96}
            height={image.height || 96}
            loading={loading}
            sizes="96px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <h4 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary md:text-lg">
          {product.title}
        </h4>
        <div className="text-lg font-semibold text-foreground">
          {formatMoney(product.priceRange.minVariantPrice)}
        </div>
      </div>
      <div className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </div>
    </Link>
  );
}

