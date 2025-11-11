import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Store,
  FileText,
  Contact,
  List,
  LucideIcon,
  Info,
  Shield,
  Mail,
  HelpCircle,
  BookOpen,
  ShoppingBag,
  Search,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMenuItemIcon(title: string): LucideIcon {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("collection")) return Store;
  if (titleLower.includes("blog")) return FileText;
  if (titleLower.includes("policy")) return FileText;
  if (titleLower.includes("about")) return FileText;
  if (titleLower.includes("contact")) return Contact;
  if (titleLower.includes("catalog")) return List;
  return Store;
}

export const getFooterIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("policy") || lowerTitle.includes("privacy")) {
    return Shield;
  }
  if (lowerTitle.includes("about")) {
    return Info;
  }
  if (lowerTitle.includes("contact")) {
    return Mail;
  }
  if (lowerTitle.includes("help") || lowerTitle.includes("support")) {
    return HelpCircle;
  }
  if (lowerTitle.includes("blog") || lowerTitle.includes("news")) {
    return BookOpen;
  }
  if (lowerTitle.includes("shop") || lowerTitle.includes("store")) {
    return ShoppingBag;
  }
  if (lowerTitle.includes("search") || lowerTitle.includes("search")) {
    return Search;
  }
  return FileText;
};

export function generateBreadcrumbs(
  pathname: string
): Array<{ label: string; path: string }> {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ label: string; path: string }> = [
    { label: "Home", path: "/" },
  ];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Format label based on segment
    let label = segment;

    // Handle common route patterns
    if (segment === "collections") {
      label = "Collections";
    } else if (segment === "products") {
      label = "Products";
    } else if (segment === "pages") {
      label = "Pages";
    } else if (segment === "blogs") {
      label = "Blog";
    } else if (segment === "account") {
      label = "Account";
    } else if (segment === "cart") {
      label = "Cart";
    } else if (segment === "search") {
      label = "Search";
    } else if (segment === "policies") {
      label = "Policies";
    } else {
      // Capitalize and format the segment (handle hyphens, etc.)
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Formats a money value from Shopify Storefront API
 * @param money - Money object with amount (string) and currencyCode
 * @returns Formatted price string (e.g., "$10.00")
 */
export function formatMoney(money: {
  amount: string;
  currencyCode: string;
}): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}
