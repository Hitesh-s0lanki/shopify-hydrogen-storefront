import Link from "next/link";
import { getAllProducts } from "@/modules/collections/actions";
import { ProductItem } from "@/components/product-item";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Grid3x3 } from "lucide-react";

export const metadata = {
  title: "All Products",
  description: "Browse all our products from every collection",
};

export default async function AllProductsPage() {
  const { products, pageInfo } = await getAllProducts(24);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav
            className="text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li>
                <Link
                  href="/collections"
                  className="hover:text-foreground transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground font-medium">All Products</li>
            </ol>
          </nav>
        </div>

        {/* Back to Collections Button */}
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </Button>
        </div>

        {/* Title and Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Grid3x3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                All Products
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Discover our complete catalog of products from all collections
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          {/* Products Count */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <p className="text-sm font-medium text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
              {pageInfo.hasNextPage && " (showing first page)"}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50"
              >
                <ProductItem
                  product={product}
                  loading={index < 4 ? "eager" : "lazy"}
                />
              </div>
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
          <Grid3x3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No products found.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back later for new products.
          </p>
        </div>
      )}
    </div>
  );
}

