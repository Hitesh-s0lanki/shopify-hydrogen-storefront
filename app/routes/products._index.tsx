import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/products._index';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PRODUCTS_QUERY} from '~/actions/products/queries';
import {useVariantUrl} from '~/lib/variants';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Products | Hydrogen'}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    context.storefront.query(PRODUCTS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

type Product = Awaited<ReturnType<typeof loadCriticalData>>['products']['nodes'][number];

export default function Products() {
  const data = useLoaderData<typeof loader>();
  const {products} = data;

  return (
    <div className="products min-h-full bg-background py-8 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="mb-8 text-2xl font-semibold text-foreground md:text-3xl">
          Products
        </h1>
        <PaginatedResourceSection<Product>
          connection={products}
          resourcesClassName="products-list flex flex-col gap-4"
        >
          {({node: product, index}) => (
            <ProductListItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ProductListItem({
  product,
  loading,
}: {
  product: Product;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      className="product-item group relative flex flex-row items-center gap-4 overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted md:h-24 md:w-24">
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
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
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
      <div className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </div>
    </Link>
  );
}

