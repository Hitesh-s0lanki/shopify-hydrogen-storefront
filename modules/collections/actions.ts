"use server";

import { shopifyClient } from "@/lib/shopify-client";
import type {
  Collection,
  CollectionProduct,
  CollectionWithProducts,
  CollectionsQueryResult,
} from "./types";

export async function getCollections(
  first: number = 20,
  after?: string | null
): Promise<{
  collections: Collection[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}> {
  const response = await shopifyClient.request<CollectionsQueryResult>(
    STORE_COLLECTIONS_QUERY,
    {
      variables: {
        first,
        endCursor: after || null,
      },
    }
  );

  if (!response.data) {
    return {
      collections: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  }

  return {
    collections: response.data.collections.nodes,
    pageInfo: response.data.collections.pageInfo,
  };
}

export async function getCollectionByHandle(
  handle: string,
  first: number = 20,
  after?: string | null
): Promise<CollectionWithProducts | null> {
  const response = await shopifyClient.request(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle,
      first,
      endCursor: after || null,
    },
  });

  return response.data?.collection || null;
}

export async function getAllProducts(
  first: number = 20,
  after?: string | null
): Promise<{
  products: CollectionProduct[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}> {
  const response = await shopifyClient.request(STORE_PRODUCTS_QUERY, {
    variables: {
      first,
      endCursor: after || null,
    },
  });

  if (!response.data) {
    return {
      products: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  }

  return {
    products: response.data.products.nodes,
    pageInfo: response.data.products.pageInfo,
  };
}

const STORE_COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  fragment ProductItem on Product {
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
  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
` as const;

const STORE_PRODUCTS_QUERY = `#graphql
  fragment ProductItem on Product {
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
  query StoreProducts(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

