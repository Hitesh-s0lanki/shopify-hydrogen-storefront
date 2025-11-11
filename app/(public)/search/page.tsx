import { Suspense } from "react";
import { searchProducts } from "@/modules/search/actions";
import { ProductItem } from "@/components/product-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Package, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import type { SearchProduct, SearchPage, SearchArticle } from "@/modules/search/types";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export const metadata = {
  title: "Search",
  description: "Search for products, pages, and articles",
};

function SearchResults({
  products,
  pages,
  articles,
  searchTerm,
}: {
  products: SearchProduct[];
  pages: SearchPage[];
  articles: SearchArticle[];
  searchTerm: string;
}) {
  const hasResults =
    products.length > 0 || pages.length > 0 || articles.length > 0;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 py-16 text-center">
        <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">
          No results found for &quot;{searchTerm}&quot;
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try different keywords or browse our collections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Products Section */}
      {products.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Products</h2>
            <span className="text-sm text-muted-foreground">
              ({products.length})
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const variant = product.selectedOrFirstAvailableVariant;
              if (!variant) return null;
              
              const productData = {
                id: product.id,
                title: product.title,
                handle: product.handle,
                priceRange: {
                  minVariantPrice: variant.price,
                },
                featuredImage: variant.image
                  ? {
                      id: variant.id,
                      url: variant.image.url,
                      altText: variant.image.altText,
                      width: variant.image.width,
                      height: variant.image.height,
                    }
                  : null,
              };
              return (
                <ProductItem
                  key={product.id}
                  product={productData}
                  loading={index < 4 ? "eager" : "lazy"}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Pages Section */}
      {pages.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Pages</h2>
            <span className="text-sm text-muted-foreground">
              ({pages.length})
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.handle}`}
                className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      {articles.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Articles</h2>
            <span className="text-sm text-muted-foreground">
              ({articles.length})
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blogs/${article.blog.handle}/${article.handle}`}
                className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Blog: {article.blog.handle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const searchTerm = params.q || "";

  let results = {
    products: { nodes: [] as SearchProduct[] },
    pages: { nodes: [] as SearchPage[] },
    articles: { nodes: [] as SearchArticle[] },
  };

  if (searchTerm) {
    const searchResults = await searchProducts(searchTerm, 20);
    results = searchResults;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <SearchIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Search
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Find products, pages, and articles
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form action="/search" method="get" className="mb-8">
        <div className="flex gap-2">
          <Input
            type="search"
            name="q"
            placeholder="Search for products, pages, articles..."
            defaultValue={searchTerm}
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {searchTerm ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          }
        >
          <SearchResults
            products={results.products.nodes}
            pages={results.pages.nodes}
            articles={results.articles.nodes}
            searchTerm={searchTerm}
          />
        </Suspense>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 py-16 text-center">
          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            Enter a search term to get started
          </p>
        </div>
      )}
    </div>
  );
}

