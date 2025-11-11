// src/modules/cart/types.ts

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

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
    compareAtAmountPerQuantity?: Money | null;
  };
  merchandise: {
    id: string;
    availableForSale: boolean;
    requiresShipping: boolean;
    title: string;
    price: Money;
    compareAtPrice?: Money | null;
    image?: Image | null;
    product: {
      id: string;
      handle: string;
      title: string;
      vendor: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount?: Money | null;
    totalDutyAmount?: Money | null;
  };
  lines: {
    nodes: CartLine[];
  };
};

