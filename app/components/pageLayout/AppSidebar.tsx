import {Suspense} from 'react';
import {Await, Link, NavLink, useLocation} from 'react-router';
import {
  User,
  Store,
  Heart,
  Github,
  Twitter,
  Facebook,
  Instagram,
  FileText,
  HelpCircle,
  Info,
  Shield,
  Mail,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '~/components/ui/sidebar';
import {FALLBACK_HEADER_MENU} from './constants';
import {getMenuItemIcon} from './getMenuItemIcon';

interface AppSidebarProps {
  header: HeaderQuery;
  footer: Promise<FooterQuery | null>;
  publicStoreDomain: string;
  isLoggedIn: Promise<boolean>;
}

export function AppSidebar({
  header,
  footer,
  publicStoreDomain,
  isLoggedIn,
}: AppSidebarProps) {
  const location = useLocation();
  const {shop, menu} = header;

  const menuItems = (menu || FALLBACK_HEADER_MENU).items
    .map((item) => {
      if (!item.url) return null;

      const url =
        item.url.includes('myshopify.com') ||
        item.url.includes(publicStoreDomain) ||
        item.url.includes(header.shop.primaryDomain?.url || '')
          ? new URL(item.url).pathname
          : item.url;

      return {
        id: item.id,
        title: item.title,
        url,
        icon: getMenuItemIcon(item.title),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" prefetch="intent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{shop.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Store
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url} prefetch="intent">
                      {item.icon}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Suspense
                  fallback={
                    <SidebarMenuButton disabled>
                      <User className="size-4" />
                      <span>Loading...</span>
                    </SidebarMenuButton>
                  }
                >
                  <Await resolve={isLoggedIn}>
                    {(loggedIn) => (
                      <SidebarMenuButton asChild>
                        <Link
                          to="/account"
                          prefetch="intent"
                          className="flex items-center gap-2"
                        >
                          <User className="size-4" />
                          <span>{loggedIn ? 'Account' : 'Sign In'}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </Await>
                </Suspense>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Footer Menu Links Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense
              fallback={
                <SidebarMenu>
                  {[1, 2, 3].map((i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton disabled>
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              }
            >
              <Await resolve={footer}>
                {(footerData) => {
                  const footerMenu = footerData?.menu;
                  const footerItems =
                    footerMenu?.items?.filter((item) => item.url) || [];

                  if (footerItems.length === 0) {
                    return null;
                  }

                  // Icon mapping for footer items
                  const getFooterIcon = (title: string) => {
                    const lowerTitle = title.toLowerCase();
                    if (
                      lowerTitle.includes('policy') ||
                      lowerTitle.includes('privacy')
                    ) {
                      return <Shield className="size-4" />;
                    }
                    if (lowerTitle.includes('about')) {
                      return <Info className="size-4" />;
                    }
                    if (lowerTitle.includes('contact')) {
                      return <Mail className="size-4" />;
                    }
                    if (
                      lowerTitle.includes('help') ||
                      lowerTitle.includes('support')
                    ) {
                      return <HelpCircle className="size-4" />;
                    }
                    if (
                      lowerTitle.includes('blog') ||
                      lowerTitle.includes('news')
                    ) {
                      return <BookOpen className="size-4" />;
                    }
                    if (
                      lowerTitle.includes('shop') ||
                      lowerTitle.includes('store')
                    ) {
                      return <ShoppingBag className="size-4" />;
                    }
                    return <FileText className="size-4" />;
                  };

                  return (
                    <SidebarMenu>
                      {footerItems.map((item) => {
                        if (!item.url) return null;

                        const url =
                          item.url.includes('myshopify.com') ||
                          item.url.includes(publicStoreDomain) ||
                          (header.shop.primaryDomain?.url &&
                            item.url.includes(header.shop.primaryDomain.url))
                            ? new URL(item.url).pathname
                            : item.url;

                        return (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton asChild>
                              <Link
                                to={url}
                                prefetch="intent"
                                className="flex items-center gap-2"
                              >
                                {getFooterIcon(item.title)}
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  );
                }}
              </Await>
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Attractive Footer */}
      <SidebarFooter className="border-t border-emerald-500/10 bg-gradient-to-t from-emerald-50/30 via-green-50/20 to-transparent dark:from-emerald-950/20 dark:via-green-950/10">
        <div className="relative p-4 space-y-4">
          <div className="relative space-y-4">
            {/* Social Links */}
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  type="button"
                  className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  type="button"
                  className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  type="button"
                  className="group relative flex items-center justify-center size-7 rounded-lg bg-muted/50 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center justify-center gap-1 pt-1">
              <Heart className="h-3 w-3 text-emerald-500/60" />
              <p className="text-[10px] text-muted-foreground">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
