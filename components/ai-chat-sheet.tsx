"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ShoppingBag,
  X,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { SearchProduct } from "@/modules/search/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: SearchProduct[];
}

interface AiChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiChatSheet({ open, onOpenChange }: AiChatSheetProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about our store, and provide recommendations. What are you looking for today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const quickActions = [
    "Show me best sellers",
    "What's on sale?",
    "Help me find a gift",
    "Tell me about shipping",
  ];

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        products: data.products || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error. Please try again or contact support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <SheetTitle className="text-lg">AI Shopping Assistant</SheetTitle>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setMessages([
                      {
                        id: "1",
                        role: "assistant",
                        content:
                          "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about our store, and provide recommendations. What are you looking for today?",
                        timestamp: new Date(),
                      },
                    ]);
                  }}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 1 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span>Quick actions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={async () => {
                        await handleSend(action);
                      }}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <Bot className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about our products..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-emerald-500/10 text-emerald-500"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`flex-1 space-y-2 ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
              : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Product Recommendations */}
        {message.products && message.products.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Recommended Products:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {message.products.map((product) => {
                const variant = product.selectedOrFirstAvailableVariant;
                if (!variant) return null;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    className="flex gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() => {
                      // Close chat on product click (optional)
                      // window.dispatchEvent(new CustomEvent('close-ai-chat'));
                    }}
                  >
                    {variant.image && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={variant.image.url}
                          alt={variant.image.altText || product.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    {!variant.image && (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatMoney(variant.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
