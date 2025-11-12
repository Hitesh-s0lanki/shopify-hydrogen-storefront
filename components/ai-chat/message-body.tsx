"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { QuestionSuggestions } from "./question-suggestions";
import type { MessageBodyProps } from "./types";

const QUICK_ACTIONS = [
  "Show me best sellers",
  "What's on sale?",
  "Help me find a gift",
  "Tell me about shipping",
  "What are your return policies?",
  "Show me popular products",
];

export function MessageBody({
  messages,
  isLoading,
  scrollAreaRef,
  onSuggestionSelect,
}: MessageBodyProps) {
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
  }, [messages, scrollAreaRef]);

  return (
    <ScrollArea className="flex-1 min-h-0 px-4 py-4" ref={scrollAreaRef}>
      <div className="space-y-4 pb-4">
        {messages.length === 1 && onSuggestionSelect && (
          <QuestionSuggestions
            suggestions={QUICK_ACTIONS}
            onSelect={onSuggestionSelect}
            isLoading={isLoading}
          />
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Bot className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1 rounded-lg bg-muted p-3 max-w-[85%]">
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
  );
}
