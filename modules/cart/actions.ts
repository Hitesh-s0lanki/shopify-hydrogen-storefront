"use server";

import { cookies } from "next/headers";
import { shopifyClient } from "@/lib/shopify-client";
import { CART_QUERY_FRAGMENT } from "@/lib/fragments";
import type { Cart, CartLine } from "./types";

const CART_ID_COOKIE = "cartId";

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_ID_COOKIE)?.value;
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_ID_COOKIE, cartId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;

  try {
    const response = await shopifyClient.request(CART_QUERY, {
      variables: {
        id: cartId,
        numCartLines: 250,
      },
    });

    return response.data.cart;
  } catch (error) {
    console.error("Get cart error:", error);
    return null;
  }
}

export async function createCart(): Promise<Cart> {
  const response = await shopifyClient.request(CART_CREATE_MUTATION);

  const cart = response.data.cartCreate.cart;
  await setCartId(cart.id);

  return cart;
}

export async function addToCart(
  variantId: string,
  quantity: number = 1,
  attributes: Array<{ key: string; value: string }> = []
): Promise<Cart> {
  let cartId = await getCartId();
  let cart: Cart | null = null;

  // Create cart if it doesn't exist
  if (!cartId) {
    cart = await createCart();
    cartId = cart.id;
  } else {
    cart = await getCart();
    if (!cart) {
      cart = await createCart();
      cartId = cart.id;
    }
  }

  // Add item to cart
  const response = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
    variables: {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
          attributes,
        },
      ],
    },
  });

  return response.data.cartLinesAdd.cart;
}

export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) {
    throw new Error("Cart not found");
  }

  const response = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, {
    variables: {
      cartId,
      lines: [
        {
          id: lineId,
          quantity,
        },
      ],
    },
  });

  return response.data.cartLinesUpdate.cart;
}

export async function removeCartLine(lineId: string): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) {
    throw new Error("Cart not found");
  }

  const response = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, {
    variables: {
      cartId,
      lineIds: [lineId],
    },
  });

  return response.data.cartLinesRemove.cart;
}

const CART_QUERY = `#graphql
  ${CART_QUERY_FRAGMENT}
  query Cart($id: ID!, $numCartLines: Int!) {
    cart(id: $id) {
      ...CartApiQuery
    }
  }
` as const;

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 0) {
          nodes {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const CART_LINES_ADD_MUTATION = `#graphql
  ${CART_QUERY_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const CART_LINES_UPDATE_MUTATION = `#graphql
  ${CART_QUERY_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

const CART_LINES_REMOVE_MUTATION = `#graphql
  ${CART_QUERY_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartApiQuery
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

