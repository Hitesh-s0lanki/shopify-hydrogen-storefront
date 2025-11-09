import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {RecommendedProductFragment} from 'storefrontapi.generated';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

type ProductFromQuery = RecommendedProductsQuery['products']['nodes'][number];

interface ProductItemProps {
  product: ProductFromQuery | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}

export function ProductItem({product, loading = 'lazy'}: ProductItemProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      className="group relative flex h-full flex-col overflow-hidden bg-card transition-all duration-300 hover:shadow-md"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          <>
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
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
            <Money data={product.priceRange.minVariantPrice} />
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent transition-colors group-hover:bg-primary" />
    </Link>
  );
}
