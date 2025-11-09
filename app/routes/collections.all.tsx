import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {COLLECTIONS_QUERY} from '~/actions/collections/queries';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Collections | Hydrogen'}];
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
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

type Collection = Awaited<
  ReturnType<typeof loadCriticalData>
>['collections']['nodes'][number];

export default function Collections() {
  const data = useLoaderData<typeof loader>();
  const {collections} = data;

  return (
    <div className="collections min-h-full bg-background py-8 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="mb-8 text-2xl font-semibold text-foreground md:text-3xl">
          Collections
        </h1>
        <PaginatedResourceSection<Collection>
          connection={collections}
          resourcesClassName="collections-list flex flex-col gap-4"
        >
          {({node: collection, index}) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: Collection;
  index: number;
}) {
  return (
    <Link
      className="collection-item group relative flex flex-row items-center gap-4 overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection?.image && (
        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted md:h-16 md:w-28">
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="16/9"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="112px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <h5 className="text-lg font-normal text-foreground transition-colors group-hover:text-primary">
          {collection.title}
        </h5>
      </div>
      <div className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </div>
    </Link>
  );
}
