"use client";

import { useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";
import { CartSheet } from "@/components/cart-sheet";
import { AiChatSheet } from "@/components/ai-chat-sheet";

type Props = {
  children: React.ReactNode;
};

const PageLayout = ({ children }: Props) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 min-w-0 h-screen gap-2 p-2">
        <SidebarInset
          className={cn(
            "min-w-0 transition-all duration-300 shadow rounded-2xl"
            // aiChatOpen ? 'w-2/3' : 'flex-1'
          )}
        >
          <AppHeader
            isLoggedIn={false}
            onCartOpen={() => setCartOpen(true)}
            onAiChatOpen={() => setAiChatOpen(!aiChatOpen)}
            isAiChatOpen={aiChatOpen}
            aiChatOpen={aiChatOpen}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
      <SidebarRail />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      <AiChatSheet open={aiChatOpen} onOpenChange={setAiChatOpen} />
    </SidebarProvider>
  );
};

export default PageLayout;
