import {useLoaderData, Form, Link, useNavigate} from 'react-router';
import type {Route} from './+types/search';
import {
  getPaginationVariables,
  Analytics,
  Image,
  Money,
} from '@shopify/hydrogen';
import {
  type RegularSearchReturn,
  type PredictiveSearchReturn,
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
} from '~/lib/search';
import type {PredictiveSearchQuery} from 'storefrontapi.generated';
import {Input} from '~/components/ui/input';
import {useVariantUrl} from '~/lib/variants';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '~/components/ui/empty';
import {SearchX, Search as SearchIcon, Package, Layers} from 'lucide-react';
import {Button} from '~/components/ui/button';

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Search`}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');

  const searchPromise: Promise<PredictiveSearchReturn | RegularSearchReturn> =
    isPredictive
      ? predictiveSearch({request, context})
      : regularSearch({request, context});

  searchPromise.catch((error: Error) => {
    console.error(error);
    return {
      type: 'predictive' as const,
      term: '',
      result: getEmptyPredictiveSearchResult(),
      error: error.message,
    };
  });

  return await searchPromise;
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (type === 'predictive') return null;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('q') as string;
    if (searchTerm?.trim()) {
      void navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search min-h-full bg-background py-8 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        {/* Search Form */}
        <Form
          method="get"
          action="/search"
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="flex gap-2">
            <Input
              name="q"
              type="search"
              placeholder="Search for products, collections, and more..."
              defaultValue={term}
              value={term}
              onChange={(e) => {
                void navigate(
                  `/search?q=${encodeURIComponent(e.target.value.trim())}`,
                );
              }}
              className="flex-1 max-w-[500px]"
            />
          </div>
        </Form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Search Results */}
        {!term ? (
          <Empty className="border-0 py-16">
            <EmptyMedia variant="icon">
              <SearchIcon className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-xl">Start Your Search</EmptyTitle>
              <EmptyDescription className="mt-2">
                Enter a search term above to find products, pages, and articles
                from our store.
              </EmptyDescription>
            </EmptyHeader>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" asChild className="gap-2">
                <Link to="/products">
                  <Package className="h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/collections">
                  <Layers className="h-4 w-4" />
                  View Collections
                </Link>
              </Button>
            </div>
          </Empty>
        ) : !result?.total ? (
          <Empty className="border-0 py-16">
            <EmptyMedia variant="icon">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-xl">
                No results found for &quot;{term}&quot;
              </EmptyTitle>
              <EmptyDescription className="mt-2">
                We couldn&apos;t find any products, pages, or articles matching
                your search. Try adjusting your search terms or explore our
                collections.
              </EmptyDescription>
            </EmptyHeader>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" asChild className="gap-2">
                <Link to="/products">
                  <Package className="h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/collections">
                  <Layers className="h-4 w-4" />
                  View Collections
                </Link>
              </Button>
            </div>
          </Empty>
        ) : (
          <div className="space-y-8">
            {/* Products Section */}
            {result.items.products?.nodes &&
              result.items.products.nodes.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Products ({result.items.products.nodes.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {result.items.products.nodes.map(
                      (
                        product: (typeof result.items.products.nodes)[number],
                      ) => (
                        <SearchProductItem
                          key={product.id}
                          product={product}
                          term={term}
                        />
                      ),
                    )}
                  </div>
                  {result.items.products.pageInfo?.hasNextPage && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        More products available - pagination coming soon
                      </p>
                    </div>
                  )}
                </section>
              )}

            {/* Pages Section */}
            {result.items.pages?.nodes &&
              result.items.pages.nodes.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Pages ({result.items.pages.nodes.length})
                  </h2>
                  <div className="flex flex-col gap-3">
                    {result.items.pages.nodes.map(
                      (page: (typeof result.items.pages.nodes)[number]) => (
                        <SearchPageItem key={page.id} page={page} term={term} />
                      ),
                    )}
                  </div>
                </section>
              )}

            {/* Articles Section */}
            {result.items.articles?.nodes &&
              result.items.articles.nodes.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Articles ({result.items.articles.nodes.length})
                  </h2>
                  <div className="flex flex-col gap-3">
                    {result.items.articles.nodes.map(
                      (
                        article: (typeof result.items.articles.nodes)[number],
                      ) => (
                        <SearchArticleItem
                          key={article.id}
                          article={article}
                          term={term}
                        />
                      ),
                    )}
                  </div>
                </section>
              )}
          </div>
        )}

        <Analytics.SearchView
          data={{searchTerm: term, searchResults: result}}
        />
      </div>
    </div>
  );
}

/**
 * Product search result item
 */
function SearchProductItem({
  product,
  term,
}: {
  product: NonNullable<
    Awaited<ReturnType<typeof loader>>['result']
  >['items']['products']['nodes'][number];
  term: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.selectedOrFirstAvailableVariant?.image;
  const price = product.selectedOrFirstAvailableVariant?.price;

  return (
    <Link
      to={urlWithTrackingParams({
        baseUrl: variantUrl,
        trackingParams: product.trackingParameters,
        term,
      })}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      prefetch="intent"
    >
      {image && (
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-muted">
          <Image
            alt={image.altText || product.title}
            data={image}
            aspectRatio="1/1"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {product.title}
      </h3>
      {price && (
        <div className="mt-auto text-lg font-semibold text-foreground">
          <Money data={price} />
        </div>
      )}
    </Link>
  );
}

/**
 * Page search result item
 */
function SearchPageItem({
  page,
  term,
}: {
  page: NonNullable<
    Awaited<ReturnType<typeof loader>>['result']
  >['items']['pages']['nodes'][number];
  term: string;
}) {
  const pageUrl = urlWithTrackingParams({
    baseUrl: `/pages/${page.handle}`,
    trackingParams: page.trackingParameters,
    term,
  });

  return (
    <Link
      to={pageUrl}
      className="group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      prefetch="intent"
    >
      <div className="flex-1">
        <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {page.title}
        </h3>
      </div>
      <div className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </div>
    </Link>
  );
}

/**
 * Article search result item
 */
function SearchArticleItem({
  article,
  term,
}: {
  article: NonNullable<
    Awaited<ReturnType<typeof loader>>['result']
  >['items']['articles']['nodes'][number];
  term: string;
}) {
  const blogHandle = article.blog?.handle || 'news';
  const articleUrl = urlWithTrackingParams({
    baseUrl: `/blogs/${blogHandle}/${article.handle}`,
    trackingParams: article.trackingParameters,
    term,
  });

  return (
    <Link
      to={articleUrl}
      className="group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50"
      prefetch="intent"
    >
      <div className="flex-1">
        <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
      </div>
      <div className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1">
        →
      </div>
    </Link>
  );
}

/**
 * Regular search query and fragments
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
    blog {
      handle
    }
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

/**
 * Regular search fetcher
 */
async function regularSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');

  // Search articles, pages, and products for the `q` term
  const {
    errors,
    ...items
  }: {
    errors?: Array<{message: string}>;
    articles?: {nodes: Array<unknown>};
    pages?: {nodes: Array<unknown>};
    products?: {nodes: Array<unknown>; pageInfo?: unknown};
  } = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = Object.values(items).reduce((acc: number, item: unknown) => {
    if (item && typeof item === 'object' && 'nodes' in item) {
      return acc + (item.nodes as Array<unknown>).length;
    }
    return acc;
  }, 0);

  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {
    predictiveSearch: items,
    errors,
  }: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    });

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors
        .map(({message}: {message: string}) => message)
        .join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc: number, item: Array<unknown>) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
