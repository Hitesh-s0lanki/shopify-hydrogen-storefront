import {createStorefrontApiClient} from '@shopify/storefront-api-client';

/**
 * Creates a Shopify Storefront API client for use in React Router loaders.
 * 
 * This replaces the Hydrogen framework's storefront client for Phase 2 migration.
 */
export function createShopifyStorefrontClient(env: {
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PUBLIC_STORE_DOMAIN: string;
  PUBLIC_STOREFRONT_API_VERSION?: string;
}) {
  const apiVersion = env.PUBLIC_STOREFRONT_API_VERSION || '2024-10';
  
  const client = createStorefrontApiClient({
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    apiVersion: apiVersion as any,
    publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
  });

  return {
    query: async <T = any>(
      query: string,
      options?: {
        variables?: Record<string, any>;
        cache?: RequestCache;
      }
    ): Promise<T> => {
      const response = await client.request(query, {
        variables: options?.variables,
      });
      
      if (response.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
      }
      
      return response.data as T;
    },
    // Helper to get i18n context from request
    getI18n: (request: Request) => {
      const url = new URL(request.url);
      const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';
      
      let language = 'EN';
      let country = 'US';
      
      if (/^[A-Z]{2}-[A-Z]{2}$/i.test(firstPathPart)) {
        [language, country] = firstPathPart.split('-') as [string, string];
      }
      
      return { language, country };
    },
  };
}

/**
 * Get environment variables from process.env (Vercel provides these at runtime)
 * Also supports .env files in development
 */
export function getShopifyEnv() {
  const PUBLIC_STOREFRONT_API_TOKEN = process.env.PUBLIC_STOREFRONT_API_TOKEN;
  const PUBLIC_STORE_DOMAIN = process.env.PUBLIC_STORE_DOMAIN;
  const PUBLIC_STOREFRONT_API_VERSION = process.env.PUBLIC_STOREFRONT_API_VERSION;
  const PUBLIC_CHECKOUT_DOMAIN = process.env.PUBLIC_CHECKOUT_DOMAIN;

  if (!PUBLIC_STOREFRONT_API_TOKEN) {
    throw new Error('PUBLIC_STOREFRONT_API_TOKEN environment variable is not set');
  }
  
  if (!PUBLIC_STORE_DOMAIN) {
    throw new Error('PUBLIC_STORE_DOMAIN environment variable is not set');
  }

  return {
    PUBLIC_STOREFRONT_API_TOKEN,
    PUBLIC_STORE_DOMAIN,
    PUBLIC_STOREFRONT_API_VERSION,
    PUBLIC_CHECKOUT_DOMAIN: PUBLIC_CHECKOUT_DOMAIN || PUBLIC_STORE_DOMAIN.replace('myshopify.com', 'checkout.shopifycs.com'),
  };
}

