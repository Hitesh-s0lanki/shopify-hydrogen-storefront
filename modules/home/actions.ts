"use server";

import { shopifyClient } from "@/lib/shopify-client";
import { FeaturedCollection } from "./types";

export async function getFeaturedCollection(): Promise<FeaturedCollection> {
  const response = await shopifyClient.request(FEATURED_COLLECTION_QUERY);
  if (!response.data || !response.data.collections.nodes[0]) {
    throw new Error("No featured collection found");
  }
  return response.data.collections.nodes[0];
}

export async function getRecommendedProducts() {
  const response = await shopifyClient.request(RECOMMENDED_PRODUCTS_QUERY);
  return response.data?.products.nodes || [];
}

const FEATURED_COLLECTION_QUERY = `#graphql
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
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
  }
  query RecommendedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;
