import Link from "next/link";
import { getCollections } from "@/modules/collections/actions";
import { CollectionItem } from "@/components/collection-item";
import { Button } from "@/components/ui/button";
import { Grid3x3 } from "lucide-react";

export const metadata = {
  title: "Collections",
  description: "Browse all our collections",
};

export default async function CollectionsPage() {
  const { collections, pageInfo } = await getCollections(20);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Grid3x3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Collections
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Explore our curated collections of products
          </p>
        </div>
      </div>

      {/* All Products Link */}
      <div className="mb-8">
        <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
          <Link href="/collections/all">
            <Grid3x3 className="mr-2 h-4 w-4" />
            View All Products
          </Link>
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              loading={collections.indexOf(collection) < 4 ? "eager" : "lazy"}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 py-16 text-center">
          <Grid3x3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No collections found.
          </p>
        </div>
      )}

      {/* Pagination - Future enhancement */}
      {pageInfo.hasNextPage && (
        <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            More collections available. Pagination coming soon.
          </p>
        </div>
      )}
    </div>
  );
}

