"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Bot, User, ShoppingBag } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
      <div className={`flex-1 space-y-2 min-w-0 ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-lg p-3 overflow-hidden ${
            isUser
              ? "bg-primary text-primary-foreground ml-auto max-w-[85%]"
              : "bg-muted max-w-[85%]"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words overflow-hidden">
              {message.content}
            </p>
          ) : (
            <div className="max-w-none overflow-hidden text-sm break-words [&>*]:overflow-hidden [&>*]:break-words">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="m-0 mb-2 last:mb-0 text-foreground break-words overflow-hidden">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold mt-2 mb-2 first:mt-0 text-foreground break-words overflow-hidden">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mt-2 mb-2 first:mt-0 text-foreground break-words overflow-hidden">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0 text-foreground break-words overflow-hidden">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside my-2 space-y-1 text-foreground break-words overflow-hidden pl-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside my-2 space-y-1 text-foreground break-words overflow-hidden pl-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground break-words overflow-hidden">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">{children}</em>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted-foreground/20 text-foreground px-1 py-0.5 rounded text-xs font-mono break-words">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-muted-foreground/20 text-foreground p-2 rounded text-xs font-mono overflow-x-auto break-words">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted-foreground/20 p-2 rounded text-xs font-mono overflow-x-auto break-words my-2">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-3 my-2 italic text-muted-foreground break-words overflow-hidden">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80 break-words"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => (
                    <hr className="my-3 border-t border-border" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
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
                  >
                    {variant.image ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={variant.image.url}
                          alt={variant.image.altText || product.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
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

