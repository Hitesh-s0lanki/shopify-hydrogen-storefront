"use client";

import React, { Suspense, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, SparklesIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { generateBreadcrumbs } from "@/lib/utils";
import { SearchCommand } from "@/components/search-command";

// Cart Header Button Component
function CartHeaderButton({ onCartOpen }: { onCartOpen: () => void }) {
  const [cartQuantity, setCartQuantity] = React.useState(0);

  React.useEffect(() => {
    const fetchCartQuantity = async () => {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        if (data.cart) {
          setCartQuantity(data.cart.totalQuantity || 0);
        }
      } catch (error) {
        // Ignore errors
      }
    };

    fetchCartQuantity();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartQuantity();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCartOpen}
      className="relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {cartQuantity > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {cartQuantity > 99 ? "99+" : cartQuantity}
        </span>
      )}
      <span className="sr-only">Cart</span>
    </Button>
  );
}

interface AppHeaderProps {
  isLoggedIn?: Promise<boolean> | boolean;
  isAiChatOpen?: boolean;
  onCartOpen?: () => void;
  onSearchOpen?: () => void;
  onAiChatOpen?: () => void;
  aiChatOpen?: boolean;
}

const AppHeader = ({
  isLoggedIn,
  isAiChatOpen,
  onCartOpen,
  onAiChatOpen,
  aiChatOpen = false,
}: AppHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  const { toggleSidebar, open } = useSidebar();

  const handleAiChatOpen = () => {
    onAiChatOpen?.();
    if (open) {
      toggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 rounded-t-2xl">
      <SidebarTrigger disabled={aiChatOpen} />
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Breadcrumb>
          <BreadcrumbList className="overflow-hidden">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.path || index}>
                  <BreadcrumbItem className="shrink-0">
                    {isLast ? (
                      <BreadcrumbPage className="truncate max-w-[200px]">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={crumb.path}
                          className="truncate max-w-[150px]"
                        >
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="relative"
        >
          <Search className="size-4" />
          <span className="sr-only">Search</span>
        </Button>

        <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

        <CartHeaderButton onCartOpen={onCartOpen ?? (() => {})} />

        {!isAiChatOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAiChatOpen}
            className={`group relative overflow-hidden rounded-full bg-primary/10 from-emerald-500/20 via-green-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:via-green-500/30 hover:to-teal-500/30 transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-110 ${
              aiChatOpen ? "bg-emerald-500/30 border-emerald-500/60" : ""
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/20 to-transparent rounded-full" />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-600/0 via-green-600/0 to-teal-600/0 group-hover:from-emerald-600/20 group-hover:via-green-600/20 group-hover:to-teal-600/20 transition-all duration-500 rounded-full" />

            {/* Icon with glow */}
            <SparklesIcon className="size-4 relative z-10 text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,1)] transition-all duration-300 group-hover:rotate-12" />
            <span className="sr-only">AI Assistant</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
