import { notFound } from "next/navigation";
import Image from "next/image";
import { getCollectionByHandle } from "@/modules/collections/actions";
import { ProductItem } from "@/components/product-item";

type Props = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: collection.title,
    description: collection.description || `Browse ${collection.title} collection`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products.nodes;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Collection Header */}
      <div className="mb-8 md:mb-12">
        {/* Collection Image */}
        {collection.image && (
          <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted md:mb-8">
            <Image
              alt={collection.image.altText || collection.title}
              src={collection.image.url}
              width={collection.image.width || 1200}
              height={collection.image.height || 675}
              priority
              className="h-full w-full object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Collection Title and Description */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {collection.title}
          </h1>
          {collection.description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground md:prose-base"
              dangerouslySetInnerHTML={{ __html: collection.description }}
            />
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={products.indexOf(product) < 4 ? "eager" : "lazy"}
              />
            ))}
          </div>

          {/* Pagination - Future enhancement */}
          {collection.products.pageInfo.hasNextPage && (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                More products available. Pagination coming soon.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No products found in this collection.
          </p>
        </div>
      )}
    </div>
  );
}

