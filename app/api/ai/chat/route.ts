import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchAllProducts, fetchAllCollections } from "./helpers";
import type { SearchProduct } from "@/modules/search/types";

export const runtime = "nodejs";

// ----------------------
// Shopping Assistant System Prompt
// ----------------------
const SHOPPING_ASSISTANT_INSTRUCTIONS = `
You are a polite and friendly AI shopping assistant for a Shopify storefront app.

Your job:
- Help users understand products, collections, availability, and basic store navigation.
- Answer briefly, clearly, and in a helpful, conversational tone.
- When users ask about specific products or collections, use the available tools to fetch accurate information.
- Do NOT invent store policies, prices, discounts, or contact info unless you have verified information.
- If a user asks for more support or how to contact someone, suggest they use the "Contact" section of the website.
- When showing products, be enthusiastic but accurate about product details.
- If you are unsure about something, say so and suggest using the Contact section.

Always use the tools to get real product and collection data before answering questions about them.
`.trim();

// ----------------------
// Tool Definitions
// ----------------------
const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_product_data",
      description:
        "Retrieves COMPLETE and DETAILED information about products. This tool provides comprehensive product data including: title, description, price, availability, variants, images, specifications, and all other product attributes. ALWAYS use this tool when users ask ANY question related to products - whether about price, availability, features, description, variants, images, or any other product information. You can search by product name/query, or if no search term is provided, it will return all available products. The tool returns the complete product dataset, so use it for all product-related queries.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: {
            type: "string",
            description:
              'Optional: Search term to find products by name or description. If not provided, returns all products. Examples: "laptop", "shoes", "electronics".',
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_collection_data",
      description:
        "Retrieves COMPLETE and DETAILED information about collections. This tool provides comprehensive collection data including: title, description, products in the collection, and all other collection attributes. ALWAYS use this tool when users ask ANY question related to collections or product categories - whether about what products are in them, collection details, or browsing items. You can search by collection name/query, or if no search term is provided, it will return all available collections. The tool returns the complete collection dataset with all associated products, so use it for all collection-related queries.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: {
            type: "string",
            description:
              'Optional: Search term to find collections by name or description. If not provided, returns all collections. Examples: "summer", "electronics", "featured".',
          },
        },
        required: [],
      },
    },
  },
];

// ----------------------
// Helper function to execute tool calls
// ----------------------
async function executeToolCall(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
): Promise<{ tool_call_id: string; role: "tool"; content: string }> {
  if (toolCall.type !== "function") {
    throw new Error(`Unsupported tool call type: ${toolCall.type}`);
  }

  const toolCallId = toolCall.id;
  const fn = toolCall.function;
  const { name, arguments: argsStr } = fn;

  console.log(`[Tool Execution] Starting tool: ${name}`, {
    toolCallId,
    arguments: argsStr,
  });

  let args: { searchQuery?: string };
  try {
    args = JSON.parse(argsStr);
    console.log(`[Tool Execution] Parsed arguments for ${name}:`, args);
  } catch {
    const error = `Invalid JSON arguments for tool ${name}: ${argsStr}`;
    console.error(`[Tool Execution] Error parsing arguments:`, error);
    throw new Error(error);
  }

  try {
    let result: string;
    const startTime = Date.now();

    if (name === "get_product_data") {
      const searchQuery = args.searchQuery?.toLowerCase().trim() || "";

      console.log(
        `[Tool Execution] Fetching product data${
          searchQuery ? ` for query: ${searchQuery}` : " (all products)"
        }`
      );

      const products = await fetchAllProducts(searchQuery || undefined);
      console.log(`[Tool Execution] Fetched ${products.length} products`);

      if (products.length === 0) {
        console.warn(
          `[Tool Execution] No products found${
            searchQuery ? ` matching "${searchQuery}"` : ""
          }`
        );
        result = JSON.stringify(
          {
            message: searchQuery
              ? `No products found matching "${searchQuery}"`
              : "No products available",
            totalProducts: 0,
            searchQuery: searchQuery || null,
          },
          null,
          2
        );
      } else {
        result = JSON.stringify(
          {
            products: products,
            count: products.length,
            totalProducts: products.length,
            searchQuery: searchQuery || null,
          },
          null,
          2
        );
        console.log(`[Tool Execution] Returning ${products.length} product(s)`);
      }
    } else if (name === "get_collection_data") {
      const searchQuery = args.searchQuery?.toLowerCase().trim() || "";

      console.log(
        `[Tool Execution] Fetching collection data${
          searchQuery ? ` for query: ${searchQuery}` : " (all collections)"
        }`
      );

      const collections = await fetchAllCollections(searchQuery || undefined);
      console.log(`[Tool Execution] Fetched ${collections.length} collections`);

      if (collections.length === 0) {
        console.warn(
          `[Tool Execution] No collections found${
            searchQuery ? ` matching "${searchQuery}"` : ""
          }`
        );
        result = JSON.stringify(
          {
            message: searchQuery
              ? `No collections found matching "${searchQuery}"`
              : "No collections available",
            totalCollections: 0,
            searchQuery: searchQuery || null,
          },
          null,
          2
        );
      } else {
        result = JSON.stringify(
          {
            collections: collections,
            count: collections.length,
            totalCollections: collections.length,
            searchQuery: searchQuery || null,
          },
          null,
          2
        );
        console.log(
          `[Tool Execution] Returning ${collections.length} collection(s)`
        );
      }
    } else {
      const error = `Unknown tool: ${name}`;
      console.error(`[Tool Execution] ${error}`);
      throw new Error(error);
    }

    const duration = Date.now() - startTime;
    console.log(`[Tool Execution] Completed ${name} in ${duration}ms`, {
      toolCallId,
      resultLength: result.length,
    });

    return {
      tool_call_id: toolCallId,
      role: "tool" as const,
      content: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Tool Execution] Error in ${name}:`, {
      toolCallId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      tool_call_id: toolCallId,
      role: "tool" as const,
      content: `Error: ${errorMessage}`,
    };
  }
}

// ----------------------
// Convert products to SearchProduct format for frontend
// ----------------------
interface ProductData {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  };
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  selectedOrFirstAvailableVariant?: {
    id: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    };
    price?: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  } | null;
}

function formatProductsForResponse(products: ProductData[]): SearchProduct[] {
  return products.slice(0, 10).map((product) => {
    const variant = product.selectedOrFirstAvailableVariant;
    const image = variant?.image || product.featuredImage;

    return {
      __typename: "Product" as const,
      id: product.id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor || "",
      selectedOrFirstAvailableVariant: variant
        ? {
            id: variant.id,
            image: image
              ? {
                  url: image.url,
                  altText: image.altText ?? null,
                  width: image.width ?? null,
                  height: image.height ?? null,
                }
              : null,
            price: variant.price || {
              amount: product.priceRange?.minVariantPrice?.amount || "0",
              currencyCode:
                product.priceRange?.minVariantPrice?.currencyCode || "USD",
            },
            compareAtPrice: variant.compareAtPrice ?? null,
          }
        : null,
    };
  });
}

// ----------------------
// Streaming response handler
// ----------------------
async function handleStreamingResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) ||
    "";

  if (!apiKey) {
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "OpenAI API key is not configured",
            })}\n\n`
          )
        );
        controller.close();
      },
    });
    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const openai = new OpenAI({
    apiKey,
  });

  const encoder = new TextEncoder();

  // Normalize messages
  const userMessages = conversationHistory.map((msg) => ({
    role:
      msg.role === "assistant"
        ? "assistant"
        : msg.role === "system"
        ? "system"
        : msg.role === "tool"
        ? "tool"
        : "user",
    content: msg.content,
    ...(msg.role === "tool" && "tool_call_id" in msg
      ? { tool_call_id: (msg as { tool_call_id: string }).tool_call_id }
      : {}),
    ...(msg.role === "assistant" && "tool_calls" in msg
      ? {
          tool_calls: (
            msg as {
              tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
            }
          ).tool_calls,
        }
      : {}),
  })) as Array<
    | { role: "user" | "system"; content: string }
    | {
        role: "assistant";
        content: string | null;
        tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
      }
    | { role: "tool"; content: string; tool_call_id: string }
  >;

  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system" as const, content: SHOPPING_ASSISTANT_INSTRUCTIONS },
    ...userMessages,
    { role: "user" as const, content: message },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const currentMessages = [...openaiMessages];
        const maxIterations = 10;
        let iteration = 0;
        let finalProducts: SearchProduct[] = [];

        while (iteration < maxIterations) {
          iteration++;

          if (iteration > 1) {
            const toolStartEvent = `data: ${JSON.stringify({
              type: "tool-call-start",
            })}\n\n`;
            controller.enqueue(encoder.encode(toolStartEvent));
          }

          const completionStream = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: currentMessages,
            tools: TOOLS,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          });

          const assistantMessage: {
            role: "assistant";
            content: string | null;
            tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
          } = {
            role: "assistant",
            content: null,
            tool_calls: [],
          };

          let hasToolCalls = false;

          for await (const chunk of completionStream) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            const contentDelta = choice.delta?.content;
            if (contentDelta) {
              if (assistantMessage.content === null) {
                assistantMessage.content = "";
              }
              assistantMessage.content += contentDelta;

              const eventData = {
                type: "text-delta",
                textDelta: contentDelta,
              };
              const line = `data: ${JSON.stringify(eventData)}\n\n`;
              controller.enqueue(encoder.encode(line));
            }

            const toolCallDelta = choice.delta?.tool_calls;
            if (toolCallDelta && toolCallDelta.length > 0) {
              hasToolCalls = true;
              for (const toolCall of toolCallDelta) {
                const index = toolCall.index ?? 0;
                if (!assistantMessage.tool_calls) {
                  assistantMessage.tool_calls = [];
                }
                if (!assistantMessage.tool_calls[index]) {
                  if (toolCall.type === "function" || !toolCall.type) {
                    assistantMessage.tool_calls[index] = {
                      id: toolCall.id || "",
                      type: "function",
                      function: {
                        name: toolCall.function?.name || "",
                        arguments: toolCall.function?.arguments || "",
                      },
                    } as OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
                  }
                } else {
                  const existingCall = assistantMessage.tool_calls[index];
                  if (
                    existingCall.type === "function" &&
                    (toolCall.type === "function" || !toolCall.type)
                  ) {
                    existingCall.function.arguments +=
                      toolCall.function?.arguments || "";
                  }
                }
              }
            }
          }

          if (assistantMessage.content || assistantMessage.tool_calls?.length) {
            currentMessages.push(assistantMessage);
          }

          if (!hasToolCalls || !assistantMessage.tool_calls?.length) {
            // Extract products from tool results if any
            const toolResults = currentMessages.filter(
              (m) => m.role === "tool"
            ) as Array<{ role: "tool"; content: string }>;
            for (const toolResult of toolResults) {
              try {
                const data = JSON.parse(toolResult.content);
                if (data.products && Array.isArray(data.products)) {
                  finalProducts = formatProductsForResponse(data.products);
                }
              } catch {
                // Ignore parse errors
              }
            }

            const finishEvent = `data: ${JSON.stringify({
              type: "finish",
              products: finalProducts,
            })}\n\n`;
            controller.enqueue(encoder.encode(finishEvent));
            controller.close();
            return;
          }

          console.log(
            `[Chat API] Executing ${assistantMessage.tool_calls.length} tool call(s)`
          );

          const toolResults = await Promise.all(
            assistantMessage.tool_calls.map((toolCall) =>
              executeToolCall(toolCall)
            )
          );

          console.log(
            `[Chat API] Completed ${toolResults.length} tool call(s)`
          );

          for (const toolResult of toolResults) {
            currentMessages.push(toolResult);
            // Extract products from tool results
            try {
              const data = JSON.parse(toolResult.content);
              if (data.products && Array.isArray(data.products)) {
                finalProducts = formatProductsForResponse(data.products);
              }
            } catch {
              // Ignore parse errors
            }
          }

          const toolCompleteEvent = `data: ${JSON.stringify({
            type: "tool-call-complete",
            toolCalls: assistantMessage.tool_calls
              .filter((tc) => tc.type === "function")
              .map((tc) => ({
                id: tc.id,
                name: tc.type === "function" ? tc.function.name : "unknown",
              })),
          })}\n\n`;
          controller.enqueue(encoder.encode(toolCompleteEvent));
        }

        const finishEvent = `data: ${JSON.stringify({
          type: "finish",
          warning: "Maximum tool call iterations reached",
          products: finalProducts,
        })}\n\n`;
        controller.enqueue(encoder.encode(finishEvent));
        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        const errorEvent = `data: ${JSON.stringify({
          type: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ----------------------
// Main POST handler
// ----------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, stream } = body;

    // Validate input
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Check if streaming is requested
    if (stream) {
      return handleStreamingResponse(message, conversationHistory || []);
    }

    // Regular non-streaming response (fallback to simple response)
    return NextResponse.json({
      error:
        "Non-streaming mode not fully implemented. Please use streaming mode.",
      hint: "Set stream: true in your request",
    });
  } catch (error) {
    console.error("AI chat API error:", error);
    return NextResponse.json(
      {
        error: "Invalid request format",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
