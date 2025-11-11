"use server";

import { FOOTER_QUERY, HEADER_QUERY } from "@/lib/fragments";
import { shopifyClient } from "@/lib/shopify-client";
import {
  MenuItemFragment,
  ParentMenuItemFragment,
} from "@/storefrontapi.generated";
import { MenuItem } from "@/types/root.types";

export async function getHeader() {
  const [header] = await Promise.all([
    shopifyClient.request(HEADER_QUERY, {
      variables: {
        headerMenuHandle: "main-menu",
      },
    }),
  ]);

  const footer = await shopifyClient.request(FOOTER_QUERY, {
    variables: {
      footerMenuHandle: "footer", // Adjust to your footer menu handle
    },
  });

  const shop = header.data.shop;

  const menuItems = (header.data.menu?.items || [])
    .map((item: ParentMenuItemFragment) => {
      if (!item.url) return null;

      const url =
        item.url.includes("myshopify.com") ||
        item.url.includes(shop.primaryDomain?.url || "")
          ? new URL(item.url).pathname
          : item.url;

      return {
        id: item.id,
        title: item.title,
        url,
        icon: item.title,
      };
    })
    .filter((item: MenuItem | null) => item !== null);

  const footerItems = (footer.data.menu?.items || [])
    .map((item: MenuItemFragment) => {
      if (!item.url) return null;

      const url =
        item.url.includes("myshopify.com") ||
        item.url.includes(shop.primaryDomain?.url || "")
          ? new URL(item.url).pathname
          : item.url;

      return {
        id: item.id,
        title: item.title,
        url,
        icon: item.title,
      };
    })
    .filter((item: MenuItem | null) => item !== null);

  return { shop, menuItems, footerItems };
}
