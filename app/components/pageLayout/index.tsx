import React, {Suspense, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '~/components/ui/sidebar';
import {AppSidebar} from './AppSidebar';
import {AppHeader} from './AppHeader';
import {CartSheet} from './CartSheet';
import {SearchSheet} from './SearchSheet';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar
        header={header}
        publicStoreDomain={publicStoreDomain}
        isLoggedIn={isLoggedIn}
      />
      <SidebarInset>
        <AppHeader
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          onCartOpen={() => setCartOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
      <SidebarRail />

      {/* Cart Sheet */}
      <CartSheet cart={cart} open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search Sheet */}
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
