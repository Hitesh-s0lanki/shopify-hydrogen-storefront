// src/modules/search/types.ts

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type SearchProduct = {
  __typename: "Product";
  id: string;
  handle: string;
  title: string;
  vendor: string;
  selectedOrFirstAvailableVariant?: {
    id: string;
    image?: Image | null;
    price: Money;
    compareAtPrice?: Money | null;
  } | null;
};

export type SearchPage = {
  __typename: "Page";
  id: string;
  handle: string;
  title: string;
};

export type SearchArticle = {
  __typename: "Article";
  id: string;
  handle: string;
  title: string;
  blog: {
    handle: string;
  };
};

export type SearchResults = {
  products: {
    nodes: SearchProduct[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
  pages: {
    nodes: SearchPage[];
  };
  articles: {
    nodes: SearchArticle[];
  };
};

