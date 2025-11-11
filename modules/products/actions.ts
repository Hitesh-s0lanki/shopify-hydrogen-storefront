"use server";

import { shopifyClient } from "@/lib/shopify-client";
import type {
  Product,
  ProductsQueryResult,
  ProductQueryResult,
} from "./types";

export async function getProducts(
  first: number = 20,
  after?: string | null
): Promise<{
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}> {
  const response = await shopifyClient.request<ProductsQueryResult>(
    PRODUCTS_QUERY,
    {
      variables: {
        first,
        endCursor: after || null,
      },
    }
  );

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

export async function getProductByHandle(
  handle: string,
  selectedOptions: Array<{ name: string; value: string }> = []
): Promise<Product | null> {
  const response = await shopifyClient.request<ProductQueryResult>(
    PRODUCT_QUERY,
    {
      variables: {
        handle,
        selectedOptions,
      },
    }
  );

  return response.data?.product || null;
}

const PRODUCTS_QUERY = `#graphql
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

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
  }
` as const;

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_VARIANT_FRAGMENT}
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
` as const;

