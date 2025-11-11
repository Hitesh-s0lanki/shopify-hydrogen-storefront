import { createStorefrontApiClient } from "@shopify/storefront-api-client";

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.PUBLIC_STORE_DOMAIN!,
  apiVersion: "2025-07",
  publicAccessToken: process.env.PUBLIC_STOREFRONT_API_TOKEN!,
});
