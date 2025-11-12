"use client";

import * as React from "react";
import axios, { AxiosRequestConfig } from "axios";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Trash2 } from "lucide-react";
import { MessageBody } from "./message-body";
import { SendMessage } from "./send-message";
import type { Message, AiChatSheetProps } from "./types";

export type { AiChatSheetProps } from "./types";

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

  const handleSuggestionSelect = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (
    customMessage?: string,
    useStreaming: boolean = true
  ) => {
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

    const assistantMessageId = (Date.now() + 1).toString();

    try {
      if (useStreaming) {
        await handleStreamingResponse(
          messageToSend,
          assistantMessageId,
          messages.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        );
      } else {
        await handleRegularResponse(messageToSend, assistantMessageId);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      handleError(error, assistantMessageId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularResponse = async (
    messageToSend: string,
    assistantMessageId: string
  ) => {
    const config: AxiosRequestConfig = {
      method: "POST",
      url: "/api/ai/chat",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        message: messageToSend,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    };

    const response = await axios(config);

    if (response.status >= 400) {
      throw new Error(
        response.data?.error || `Request failed with status ${response.status}`
      );
    }

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format from server");
    }

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content:
        response.data.response || "I'm sorry, I couldn't process that request.",
      timestamp: new Date(),
      products: response.data.products || [],
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleStreamingResponse = async (
    messageToSend: string,
    messageId: string,
    conversationHistory: Array<{ role: string; content: string }>
  ) => {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: conversationHistory,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let products: Message["products"] = [];
      let buffer = "";

      const streamingMessage: Message = {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        products: [],
      };

      setMessages((prev) => [...prev, streamingMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              // Handle text deltas
              if (data.type === "text-delta" && data.textDelta) {
                accumulatedContent += data.textDelta;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }

              // Handle tool call start (optional - can show loading indicator)
              if (data.type === "tool-call-start") {
                // Could show a "searching..." indicator here
                console.log("[Chat] Tool call started");
              }

              // Handle tool call complete
              if (data.type === "tool-call-complete") {
                console.log("[Chat] Tool call completed", data.toolCalls);
              }

              // Handle finish event
              if (data.type === "finish") {
                if (data.products) {
                  products = data.products;
                }
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          products: products,
                        }
                      : msg
                  )
                );
                return; // Stream complete
              }

              // Handle error event
              if (data.type === "error") {
                throw new Error(data.error || "Unknown error occurred");
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }

      // Final update if stream ended without finish event
      if (accumulatedContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: accumulatedContent, products }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Streaming error:", error);
      const errorMessage: Message = {
        id: messageId,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "I'm sorry, I encountered an error while streaming. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? errorMessage : msg))
      );
    }
  };

  const handleError = (error: unknown, assistantMessageId: string) => {
    let errorContent = "I'm sorry, I encountered an error. Please try again.";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorContent =
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        if (error.response.data?.details) {
          errorContent += ` - ${error.response.data.details}`;
        }
      } else if (error.request) {
        errorContent =
          "Unable to connect to the server. Please check your connection and try again.";
      } else {
        errorContent =
          error.message || "An error occurred while setting up the request.";
      }

      if (error.code === "ECONNABORTED") {
        errorContent = "Request timed out. Please try again.";
      }
    } else if (error instanceof Error) {
      errorContent = error.message;
    }

    const errorMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: errorContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, errorMessage]);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about our store, and provide recommendations. What are you looking for today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-lg p-0 h-full max-h-screen overflow-hidden"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
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
                  onClick={handleClearChat}
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

        <MessageBody
          messages={messages}
          isLoading={isLoading}
          scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
          onSuggestionSelect={handleSuggestionSelect}
        />

        <SendMessage
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  );
}
