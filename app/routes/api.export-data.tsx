import type {Route} from './+types/api.export-data';
import {PRODUCTS_QUERY} from '~/actions/products/queries';
import {COLLECTIONS_QUERY} from '~/actions/collections/queries';

/**
 * Route to export all products and collections from Shopify to JSON files
 * This is a test route for data export
 *
 * Usage:
 * - /api/export-data?type=products - Download products.json
 * - /api/export-data?type=collections - Download collections.json
 * - /api/export-data - Get summary with both datasets
 *
 * Note: This route works in Cloudflare Workers environment by returning downloadable JSON files.
 */
export async function loader({context, request}: Route.LoaderArgs) {
  try {
    const {storefront} = context;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // Fetch all products with pagination
    const allProducts = await fetchAllProducts(storefront);

    // Fetch all collections with pagination
    const allCollections = await fetchAllCollections(storefront);

    // Return specific file based on type parameter
    if (type === 'products') {
      return new Response(JSON.stringify(allProducts, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="products.json"',
        },
      });
    }

    if (type === 'collections') {
      return new Response(JSON.stringify(allCollections, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="collections.json"',
        },
      });
    }

    // Default: return summary with both datasets
    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Data fetched successfully. Use ?type=products or ?type=collections to download specific files.',
        productsCount: allProducts.length,
        collectionsCount: allCollections.length,
        downloadUrls: {
          products: '/api/export-data?type=products',
          collections: '/api/export-data?type=collections',
        },
        // Include data in response for easy access
        data: {
          products: allProducts,
          collections: allCollections,
        },
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    console.error('Error exporting data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
      }),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}

/**
 * Fetch all products from Shopify with pagination
 */
export async function fetchAllProducts(storefront: any) {
  const allProducts: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response: any = await storefront.query(PRODUCTS_QUERY, {
      variables: {
        first: 250, // Maximum allowed by Shopify
        after: cursor,
      },
    });

    if (!response?.products?.nodes) {
      throw new Error('Invalid response from Shopify API');
    }

    allProducts.push(...response.products.nodes);
    hasNextPage = response.products.pageInfo.hasNextPage;
    cursor = response.products.pageInfo.endCursor;
  }

  return allProducts;
}

/**
 * Fetch all collections from Shopify with pagination
 */
export async function fetchAllCollections(storefront: any) {
  const allCollections: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response: any = await storefront.query(COLLECTIONS_QUERY, {
      variables: {
        first: 250, // Maximum allowed by Shopify
        after: cursor,
      },
    });

    if (!response?.collections?.nodes) {
      throw new Error('Invalid response from Shopify API');
    }

    allCollections.push(...response.collections.nodes);
    hasNextPage = response.collections.pageInfo.hasNextPage;
    cursor = response.collections.pageInfo.endCursor;
  }

  return allCollections;
}
