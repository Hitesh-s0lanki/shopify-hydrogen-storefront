// src/modules/collections/types.ts

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  id?: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  image?: Image | null;
};

export type CollectionProduct = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: Money;
  };
  featuredImage?: Image | null;
};

export type CollectionWithProducts = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: Image | null;
  products: {
    nodes: CollectionProduct[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

export type CollectionsQueryResult = {
  collections: {
    nodes: Collection[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

