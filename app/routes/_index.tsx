import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {
  FEATURED_COLLECTION_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
} from '~/actions/home/queries';
import {FeaturedCollection} from '~/components/home/FeaturedCollection';
import {RecommendedProducts} from '~/components/home/RecommendedProducts';
import {createShopifyStorefrontClient, getShopifyEnv} from '~/lib/shopifyClient';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: Route.LoaderArgs) {
  try {
    const env = getShopifyEnv();
    const storefront = createShopifyStorefrontClient(env);
    const i18n = storefront.getI18n(args.request);

    // Fetch featured collection and recommended products in parallel
    const [collectionsResult, productsResult] = await Promise.all([
      storefront.query(FEATURED_COLLECTION_QUERY, {
        variables: {
          language: i18n.language,
          country: i18n.country,
        },
      }).catch((error) => {
        console.error('Featured collection query error:', error);
        return null;
      }),
      storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
        variables: {
          language: i18n.language,
          country: i18n.country,
        },
      }).catch((error) => {
        console.error('Recommended products query error:', error);
        return null;
      }),
    ]);

    return {
      featuredCollection: collectionsResult?.collections?.nodes?.[0] || null,
      recommendedProducts: productsResult?.products?.nodes || [],
    };
  } catch (error) {
    console.error('Homepage loader error:', error);
    return {
      featuredCollection: null,
      recommendedProducts: [],
    };
  }
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home min-h-full bg-background py-8 md:py-10 space-y-10">
      {/* Hero/Featured Collection Section */}
      {data.featuredCollection && (
        <FeaturedCollection collection={data.featuredCollection} />
      )}

      {/* Recommended Products Section */}
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}
