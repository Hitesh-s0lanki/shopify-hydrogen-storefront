import React, {Suspense, lazy, useState} from 'react';
import {Await, Link, useLocation} from 'react-router';
import {Search, SparklesIcon, User} from 'lucide-react';
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
import {SidebarTrigger, useSidebar} from '~/components/ui/sidebar';
import {CartHeaderButton} from './CartHeaderButton';
import {generateBreadcrumbs} from './generateBreadcrumbs';

interface AppHeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  isAiChatOpen?: boolean;
  onCartOpen?: () => void;
  onSearchOpen?: () => void;
  onAiChatOpen?: () => void;
  aiChatOpen?: boolean;
}

const SearchCommand = lazy(() =>
  import('~/components/search/SearchCommand').then((module) => ({
    default: module.SearchCommand,
  })),
);

export function AppHeader({
  cart,
  isLoggedIn,
  isAiChatOpen,
  onCartOpen,
  onAiChatOpen,
  aiChatOpen = false,
}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  const {toggleSidebar, open} = useSidebar();

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

        <CartHeaderButton cart={cart} onCartOpen={onCartOpen ?? (() => {})} />

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

        {/* AI Assistant Button */}
        {!isAiChatOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAiChatOpen}
            className={`group relative overflow-hidden rounded-full bg-primary/10 from-emerald-500/20 via-green-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:via-green-500/30 hover:to-teal-500/30 transition-all duration-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-110 ${
              aiChatOpen ? 'bg-emerald-500/30 border-emerald-500/60' : ''
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 via-green-600/0 to-teal-600/0 group-hover:from-emerald-600/20 group-hover:via-green-600/20 group-hover:to-teal-600/20 transition-all duration-500 rounded-full" />

            {/* Icon with glow */}
            <SparklesIcon className="size-4 relative z-10 text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,1)] transition-all duration-300 group-hover:rotate-12" />
            <span className="sr-only">AI Assistant</span>
          </Button>
        )}
      </div>
    </header>
  );
}
