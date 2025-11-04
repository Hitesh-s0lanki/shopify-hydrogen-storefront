import React, {Suspense} from 'react';
import {Await, Link, NavLink, useLocation} from 'react-router';
import {User, Store} from 'lucide-react';
import type {HeaderQuery} from 'storefrontapi.generated';
import {
  Sidebar,
  SidebarContent,
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
  publicStoreDomain: string;
  isLoggedIn: Promise<boolean>;
}

export function AppSidebar({
  header,
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
      </SidebarContent>
    </Sidebar>
  );
}
