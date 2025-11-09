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
import {X, Sparkles, Zap} from 'lucide-react';
import {AppSidebar} from './AppSidebar';
import {AppHeader} from './AppHeader';
import {CartSheet} from './CartSheet';
import {SearchSheet} from './SearchSheet';
import {ChatComponent} from '~/components/ai';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';

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
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar
        header={header}
        footer={footer}
        publicStoreDomain={publicStoreDomain}
        isLoggedIn={isLoggedIn}
      />
      <div className="flex flex-1 min-w-0 h-screen gap-2 p-2">
        <SidebarInset
          className={`min-w-0 transition-all duration-300 shadow rounded-2xl ${
            aiChatOpen ? 'w-2/3' : 'flex-1'
          }`}
        >
          <AppHeader
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
            onCartOpen={() => setCartOpen(true)}
            onAiChatOpen={() => setAiChatOpen(true)}
            isAiChatOpen={aiChatOpen}
            aiChatOpen={aiChatOpen}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>

        {/* AI Chat Sidebar - 1/3 width when open */}
        {aiChatOpen && (
          <div
            className={`transition-all duration-300 ease-in-out border-l bg-background rounded-2xl shadow ${
              aiChatOpen ? 'w-[400px]' : 'w-0'
            } overflow-hidden flex flex-col`}
          >
            {aiChatOpen && (
              <div className="flex flex-col h-full">
                {/* Enhanced Header */}
                <div className="relative shrink-0 border-b bg-gradient-to-r from-emerald-50/50 via-green-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(16,185,129)_1px,transparent_0)] bg-[length:20px_20px]" />
                  </div>

                  <div className="relative flex items-center justify-between p-4 gap-3">
                    {/* Left side - Icon and Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Animated Icon Container */}
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg animate-pulse" />
                        <div className="relative flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <Sparkles className="size-4 text-emerald-500 dark:text-emerald-400" />
                        </div>
                      </div>

                      {/* Title and Badge */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-md font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                            Shopsy Assistant
                          </h2>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Powered by AI
                        </p>
                      </div>
                    </div>

                    {/* Right side - Close Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAiChatOpen(false)}
                      className="h-8 w-8 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                      aria-label="Close AI Chat"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden">
                  <ChatComponent />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <SidebarRail />

      {/* Cart Sheet */}
      <CartSheet cart={cart} open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search Sheet */}
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
