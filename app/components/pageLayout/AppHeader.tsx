import React, {Suspense, lazy, useState} from 'react';
import {Await, Link, useLocation} from 'react-router';
import {Search, User} from 'lucide-react';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {SidebarTrigger} from '~/components/ui/sidebar';
import {CartHeaderButton} from './CartHeaderButton';
import {generateBreadcrumbs} from './generateBreadcrumbs';

interface AppHeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  onCartOpen: () => void;
  onSearchOpen?: () => void;
}

const SearchCommand = lazy(() =>
  import('~/components/search/SearchCommand').then((module) => ({
    default: module.SearchCommand,
  })),
);

export function AppHeader({cart, isLoggedIn, onCartOpen}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 rounded-t-2xl">
      <SidebarTrigger />
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
                          to={crumb.path}
                          prefetch="intent"
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

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="relative"
        >
          <Search className="size-4" />
          <span className="sr-only">Search</span>
        </Button>

        <Suspense fallback={<div>Loading...</div>}>
          <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>

        <CartHeaderButton cart={cart} onCartOpen={onCartOpen} />

        <Button variant="ghost" size="icon" asChild>
          <Suspense fallback={<User className="size-4" />}>
            <Await resolve={isLoggedIn}>
              {(loggedIn) => (
                <Link to="/account" prefetch="intent">
                  <User className="size-4" />
                  <span className="sr-only">
                    {loggedIn ? 'Account' : 'Sign In'}
                  </span>
                </Link>
              )}
            </Await>
          </Suspense>
        </Button>
      </div>
    </header>
  );
}
