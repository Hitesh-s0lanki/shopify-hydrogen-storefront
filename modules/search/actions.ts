"use server";

import { shopifyClient } from "@/lib/shopify-client";
import type { SearchResults } from "./types";

export async function searchProducts(
  term: string,
  first: number = 20,
  after?: string | null
): Promise<SearchResults> {
  const response = await shopifyClient.request(REGULAR_SEARCH_QUERY, {
    variables: {
      term,
      first,
      endCursor: after || null,
    },
  });

  return response.data;
}

export async function predictiveSearch(
  term: string,
  limit: number = 5
): Promise<{
  products: Array<{
    id: string;
    title: string;
    handle: string;
    selectedOrFirstAvailableVariant?: {
      id: string;
      image?: {
        url: string;
        altText: string | null;
        width: number | null;
        height: number | null;
      } | null;
      price: {
        amount: string;
        currencyCode: string;
      };
    } | null;
  }>;
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    image?: {
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
    } | null;
  }>;
  queries: Array<{
    text: string;
    styledText: string;
  }>;
}> {
  const response = await shopifyClient.request(PREDICTIVE_SEARCH_QUERY, {
    variables: {
      term,
      limit,
      limitScope: "EACH",
      types: ["PRODUCT", "COLLECTION", "QUERY"],
    },
  });

  const predictive = response.data.predictiveSearch;

  return {
    products: predictive?.products || [],
    collections: predictive?.collections || [],
    queries: predictive?.queries || [],
  };
}

const REGULAR_SEARCH_QUERY = `#graphql
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

  fragment SearchPage on Page {
    __typename
    handle
    id
    title
    trackingParameters
  }

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

  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }

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
` as const;

const PREDICTIVE_SEARCH_QUERY = `#graphql
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

  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    trackingParameters
    image {
      url
      altText
      width
      height
    }
  }

  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }

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
      products {
        ...PredictiveProduct
      }
      collections {
        ...PredictiveCollection
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
` as const;
