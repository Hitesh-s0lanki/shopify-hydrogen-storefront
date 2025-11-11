// src/lib/types/shopify-home.ts

export type Money = {
  amount: string; // Storefront returns this as string
  currencyCode: string;
};

export type Image = {
  id?: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type FeaturedCollection = {
  id: string;
  title: string;
  handle: string;
  image?: Image | null;
};

export type RecommendedProduct = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: Money;
  };
  featuredImage?: Image | null;
};

export type FeaturedCollectionQueryResult = {
  collections: {
    nodes: FeaturedCollection[];
  };
};

export type RecommendedProductsQueryResult = {
  products: {
    nodes: RecommendedProduct[];
  };
};

export type FeaturedCollectionVariables = {
  country?: string; // or stricter: Shopify CountryCode enum as string union
  language?: string; // same for LanguageCode
};

export type RecommendedProductsVariables = FeaturedCollectionVariables;
