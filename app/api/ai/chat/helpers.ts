"use server";

import { shopifyClient } from "@/lib/shopify-client";
import { searchProducts } from "@/modules/search/actions";
import { getCollections } from "@/modules/collections/actions";

// Helper function to fetch all products (with pagination support)
export async function fetchAllProducts(searchQuery?: string) {
  try {
    if (searchQuery) {
      // Use search for specific queries
      const searchResults = await searchProducts(searchQuery, 50);
      return searchResults.products.nodes || [];
    }

    // Fetch all products with pagination
    const allProducts: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allProducts.length < 100) {
      const response: any = await shopifyClient.request(
        `#graphql
        fragment ProductItem on Product {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            id
            url
            altText
            width
            height
          }
          selectedOrFirstAvailableVariant {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
          }
        }
        query StoreProducts(
          $country: CountryCode
          $endCursor: String
          $first: Int
          $language: LanguageCode
        ) @inContext(country: $country, language: $language) {
          products(first: $first, after: $endCursor) {
            nodes {
              ...ProductItem
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
        {
          variables: {
            first: 50,
            endCursor: cursor,
          },
        }
      );

      const products = response.data?.products?.nodes || [];
      allProducts.push(...products);
      hasNextPage = response.data?.products?.pageInfo?.hasNextPage || false;
      cursor = response.data?.products?.pageInfo?.endCursor || null;
    }

    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Helper function to fetch all collections
export async function fetchAllCollections(searchQuery?: string) {
  try {
    const allCollections: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage && allCollections.length < 50) {
      const response = await getCollections(50, cursor);
      allCollections.push(...response.collections);
      hasNextPage = response.pageInfo.hasNextPage;
      cursor = response.pageInfo.endCursor;
    }

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      return allCollections.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.handle?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return allCollections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

