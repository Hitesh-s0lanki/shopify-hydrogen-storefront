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
} from "@/components/ui/sidebar";
import { cn, getFooterIcon, getMenuItemIcon } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { MenuItem } from "@/types/root.types";
import { useQuery } from "@tanstack/react-query";
import { User, Store, Heart } from "lucide-react";
import Link from "next/link";
import React from "react";
import Social from "./social";

type Props = {
  isLoggedIn?: boolean;
};

const AppSidebar = ({ isLoggedIn }: Props) => {
  const trpc = useTRPC();
  const {
    data: { shop, menuItems, footerItems } = {
      shop: null,
      menuItems: [],
      footer: [],
    },
  } = useQuery(trpc.root.getHeader.queryOptions());

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" prefetch={true}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{shop?.name}</span>
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
              {menuItems.map((item: MenuItem) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link href={item.url} prefetch={true}>
                      {React.createElement(getMenuItemIcon(item.title))}
                      <span>{item.title}</span>
                    </Link>
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
                {isLoggedIn ? (
                  <SidebarMenuButton asChild>
                    <Link
                      href="/account"
                      prefetch={true}
                      className="flex items-center gap-2"
                    >
                      <User className="size-4" />
                      <span>Account</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild>
                    <Link
                      href="/account"
                      prefetch={true}
                      className="flex items-center gap-2"
                    >
                      <User className="size-4" />
                      <span>Sign In</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Footer Menu Links Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            {(footerItems || []).map((item: MenuItem) => {
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} prefetch={true}>
                      {React.createElement(getFooterIcon(item.title))}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Attractive Footer */}
      <SidebarFooter className="border-t border-emerald-500/10 bg-gradient-to-t from-emerald-50/30 via-green-50/20 to-transparent dark:from-emerald-950/20 dark:via-green-950/10">
        <div className={cn("relative p-2 space-y-4")}>
          <div className="relative space-y-4">
            {/* Social Links */}
            <Social />

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
};

export default AppSidebar;
