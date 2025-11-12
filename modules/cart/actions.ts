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

    // Check if response exists
    if (!response) {
      console.error("No response from Shopify");
      return null;
    }

    // Check for GraphQL errors at top level
    if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
      console.error("GraphQL errors:", response.errors);
      return null;
    }

    // Handle different response structures
    const responseData = response.data || response;
    
    if (!responseData) {
      console.error("No data in response. Full response:", JSON.stringify(response, null, 2));
      return null;
    }

    if (!responseData.cart) {
      // Cart might not exist anymore
      console.log("Cart not found in response, it may have been deleted");
      return null;
    }

    return responseData.cart;
  } catch (error) {
    console.error("Get cart error:", error);
    return null;
  }
}

export async function createCart(): Promise<Cart> {
  let response;
  try {
    response = await shopifyClient.request(CART_CREATE_MUTATION);
  } catch (error) {
    console.error("Shopify API request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to Shopify API";
    throw new Error(`Failed to create cart: ${errorMessage}`);
  }

  // Log full response for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("Shopify cartCreate response:", JSON.stringify(response, null, 2));
  }

  // Check if response exists
  if (!response) {
    console.error("No response from Shopify");
    throw new Error("No response from Shopify API");
  }

  // Check for GraphQL errors at top level
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    const errorMessages = response.errors
      .map((error: { message: string }) => error.message)
      .join(", ");
    console.error("GraphQL errors:", response.errors);
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  // Handle different response structures
  let responseData = response.data || response;
  
  if (!responseData) {
    console.error("No data in response. Full response:", JSON.stringify(response, null, 2));
    throw new Error("Invalid response from Shopify API: No data property");
  }

  if (!responseData.cartCreate) {
    console.error("cartCreate not found. Available keys:", Object.keys(responseData || {}));
    console.error("Full response:", JSON.stringify(response, null, 2));
    throw new Error(`Failed to create cart: Invalid response structure. Available keys: ${Object.keys(responseData).join(", ")}`);
  }

  // Check for user errors from Shopify
  if (responseData.cartCreate.userErrors && responseData.cartCreate.userErrors.length > 0) {
    const errorMessages = responseData.cartCreate.userErrors
      .map((error: { message: string }) => error.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  if (!responseData.cartCreate.cart) {
    console.error("Cart not found in response:", responseData.cartCreate);
    throw new Error("Failed to create cart: Cart not returned");
  }

  const cart = responseData.cartCreate.cart;
  await setCartId(cart.id);

  return cart;
}

export async function addToCart(
  variantId: string,
  quantity: number = 1,
  attributes: Array<{ key: string; value: string }> = []
): Promise<Cart> {
  // Validate variantId
  if (!variantId || typeof variantId !== "string") {
    throw new Error("Invalid variant ID");
  }

  // Validate quantity
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  let cartId = await getCartId();
  let cart: Cart | null = null;

  // Create cart if it doesn't exist
  if (!cartId) {
    cart = await createCart();
    cartId = cart.id;
  } else {
    // Verify cart still exists
    cart = await getCart();
    if (!cart) {
      // Cart was deleted or invalid, create a new one
      cart = await createCart();
      cartId = cart.id;
    } else {
      // Use the cart ID from the fetched cart to ensure it's current
      cartId = cart.id;
    }
  }

  // Ensure we have a valid cartId
  if (!cartId) {
    throw new Error("Failed to get or create cart");
  }

  // Add item to cart
  let response;
  try {
    response = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
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
  } catch (error) {
    console.error("Shopify API request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to Shopify API";
    throw new Error(`Failed to add item to cart: ${errorMessage}`);
  }

  // Log full response for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("Shopify cartLinesAdd response:", JSON.stringify(response, null, 2));
  }

  // Check if response exists
  if (!response) {
    console.error("No response from Shopify");
    throw new Error("No response from Shopify API");
  }

  // Check for GraphQL errors at top level
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    const errorMessages = response.errors
      .map((error: { message: string }) => error.message)
      .join(", ");
    console.error("GraphQL errors:", response.errors);
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  // Handle different response structures
  // Some Shopify clients return data directly, others wrap it in a data property
  let responseData = response.data || response;
  
  if (!responseData) {
    console.error("No data in response. Full response:", JSON.stringify(response, null, 2));
    throw new Error("Invalid response from Shopify API: No data property");
  }

  if (!responseData.cartLinesAdd) {
    console.error("cartLinesAdd not found. Available keys:", Object.keys(responseData || {}));
    console.error("Full response:", JSON.stringify(response, null, 2));
    throw new Error(`Failed to add item to cart: Invalid response structure. Available keys: ${Object.keys(responseData).join(", ")}`);
  }

  // Check for user errors from Shopify
  if (responseData.cartLinesAdd.userErrors && responseData.cartLinesAdd.userErrors.length > 0) {
    const errorMessages = responseData.cartLinesAdd.userErrors
      .map((error: { message: string }) => error.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  if (!responseData.cartLinesAdd.cart) {
    console.error("Cart not found in response:", responseData.cartLinesAdd);
    throw new Error("Failed to add item to cart: Cart not returned");
  }

  const updatedCart = responseData.cartLinesAdd.cart;
  
  // Ensure cart ID is saved (in case it changed)
  if (updatedCart.id !== cartId) {
    await setCartId(updatedCart.id);
  }

  return updatedCart;
}

export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) {
    throw new Error("Cart not found");
  }

  let response;
  try {
    response = await shopifyClient.request(CART_LINES_UPDATE_MUTATION, {
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
  } catch (error) {
    console.error("Shopify API request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to Shopify API";
    throw new Error(`Failed to update cart: ${errorMessage}`);
  }

  // Check if response exists
  if (!response) {
    console.error("No response from Shopify");
    throw new Error("No response from Shopify API");
  }

  // Check for GraphQL errors at top level
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    const errorMessages = response.errors
      .map((error: { message: string }) => error.message)
      .join(", ");
    console.error("GraphQL errors:", response.errors);
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  // Handle different response structures
  let responseData = response.data || response;
  
  if (!responseData) {
    console.error("No data in response. Full response:", JSON.stringify(response, null, 2));
    throw new Error("Invalid response from Shopify API: No data property");
  }

  if (!responseData.cartLinesUpdate) {
    console.error("cartLinesUpdate not found. Available keys:", Object.keys(responseData || {}));
    throw new Error(`Failed to update cart: Invalid response structure. Available keys: ${Object.keys(responseData).join(", ")}`);
  }

  // Check for user errors from Shopify
  if (responseData.cartLinesUpdate.userErrors && responseData.cartLinesUpdate.userErrors.length > 0) {
    const errorMessages = responseData.cartLinesUpdate.userErrors
      .map((error: { message: string }) => error.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  if (!responseData.cartLinesUpdate.cart) {
    console.error("Cart not found in response:", responseData.cartLinesUpdate);
    throw new Error("Failed to update cart: Cart not returned");
  }

  return responseData.cartLinesUpdate.cart;
}

export async function removeCartLine(lineId: string): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) {
    throw new Error("Cart not found");
  }

  let response;
  try {
    response = await shopifyClient.request(CART_LINES_REMOVE_MUTATION, {
      variables: {
        cartId,
        lineIds: [lineId],
      },
    });
  } catch (error) {
    console.error("Shopify API request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to Shopify API";
    throw new Error(`Failed to remove cart line: ${errorMessage}`);
  }

  // Check if response exists
  if (!response) {
    console.error("No response from Shopify");
    throw new Error("No response from Shopify API");
  }

  // Check for GraphQL errors at top level
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    const errorMessages = response.errors
      .map((error: { message: string }) => error.message)
      .join(", ");
    console.error("GraphQL errors:", response.errors);
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  // Handle different response structures
  let responseData = response.data || response;
  
  if (!responseData) {
    console.error("No data in response. Full response:", JSON.stringify(response, null, 2));
    throw new Error("Invalid response from Shopify API: No data property");
  }

  if (!responseData.cartLinesRemove) {
    console.error("cartLinesRemove not found. Available keys:", Object.keys(responseData || {}));
    throw new Error(`Failed to remove cart line: Invalid response structure. Available keys: ${Object.keys(responseData).join(", ")}`);
  }

  // Check for user errors from Shopify
  if (responseData.cartLinesRemove.userErrors && responseData.cartLinesRemove.userErrors.length > 0) {
    const errorMessages = responseData.cartLinesRemove.userErrors
      .map((error: { message: string }) => error.message)
      .join(", ");
    throw new Error(errorMessages);
  }

  if (!responseData.cartLinesRemove.cart) {
    console.error("Cart not found in response:", responseData.cartLinesRemove);
    throw new Error("Failed to remove cart line: Cart not returned");
  }

  return responseData.cartLinesRemove.cart;
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

