"use server";

import { shopifyClient } from "@/lib/shopify-client";

export type Policy = {
  body: string;
  handle: string;
  id: string;
  title: string;
  url: string;
};

export type Policies = {
  privacyPolicy?: Policy | null;
  refundPolicy?: Policy | null;
  termsOfService?: Policy | null;
  shippingPolicy?: Policy | null;
};

export async function getPolicies(): Promise<Policies> {
  const response = await shopifyClient.request(POLICY_QUERY);

  return {
    privacyPolicy: response.data.shop.privacyPolicy,
    refundPolicy: response.data.shop.refundPolicy,
    termsOfService: response.data.shop.termsOfService,
    shippingPolicy: response.data.shop.shippingPolicy,
  };
}

const POLICY_QUERY = `#graphql
  query Policy {
    shop {
      privacyPolicy {
        body
        handle
        id
        title
        url
      }
      refundPolicy {
        body
        handle
        id
        title
        url
      }
      termsOfService {
        body
        handle
        id
        title
        url
      }
      shippingPolicy {
        body
        handle
        id
        title
        url
      }
    }
  }
` as const;

