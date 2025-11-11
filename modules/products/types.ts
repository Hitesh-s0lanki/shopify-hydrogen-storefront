// src/modules/products/types.ts

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

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money | null;
  image?: Image | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  sku?: string | null;
};

export type ProductOption = {
  name: string;
  optionValues: Array<{
    name: string;
    firstSelectableVariant?: ProductVariant | null;
    swatch?: {
      color?: string | null;
      image?: {
        previewImage?: {
          url?: string | null;
        } | null;
      } | null;
    } | null;
  }>;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  description?: string | null;
  descriptionHtml?: string | null;
  priceRange: {
    minVariantPrice: Money;
  };
  featuredImage?: Image | null;
  options: ProductOption[];
  selectedOrFirstAvailableVariant?: ProductVariant | null;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

export type ProductsQueryResult = {
  products: {
    nodes: Product[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

export type ProductQueryResult = {
  product: Product | null;
};

