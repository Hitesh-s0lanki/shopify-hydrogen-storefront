// app/routes/api.chat.ts
import OpenAI from 'openai';
import type {Route} from './+types/api.chat';
import {fetchAllProducts, fetchAllCollections} from './api.export-data';

// ----------------------
// Shopsy system prompt
// ----------------------
const SHOPSY_INSTRUCTIONS = `
You are "Shopsy", a polite and friendly support agent for a Shopify storefront app.

Your job:
- Help users understand products, collections, availability, and basic store navigation.
- Answer briefly, clearly, and in a helpful, conversational tone.
- Do NOT invent store policies, prices, discounts, or contact info.
- If a user asks for more support or how to contact someone,
  ALWAYS tell them to use the "Contact" section of the website.
- When users ask about specific products or collections, use the available tools to fetch accurate information.

If you are unsure about something, say so and suggest using the Contact section.
`.trim();

// ----------------------
// Global context for tool execution
// ----------------------
// Store the storefront context for use in tool execution
let storefrontContext: any = null;

// ----------------------
// Tool Definitions with Descriptions
// ----------------------
// Note: Tool execution logic is in executeToolCall function below
// These are kept as reference for the tool implementations

// OpenAI tool definitions with descriptions
const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_product_data',
      description:
        'Retrieves COMPLETE and DETAILED information about products. This tool provides comprehensive product data including: title, description, price, availability, variants, images, specifications, and all other product attributes. ALWAYS use this tool when users ask ANY question related to products - whether about price, availability, features, description, variants, images, or any other product information. You can search by product name/query, or if no search term is provided, it will return all available products. The tool returns the complete product dataset, so use it for all product-related queries.',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
            description:
              'Optional: Search term to find products by name or description. If not provided, returns all products. Examples: "laptop", "shoes", "electronics".',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_collection_data',
      description:
        'Retrieves COMPLETE and DETAILED information about collections. This tool provides comprehensive collection data including: title, description, products in the collection, and all other collection attributes. ALWAYS use this tool when users ask ANY question related to collections or product categories - whether about what products are in them, collection details, or browsing items. You can search by collection name/query, or if no search term is provided, it will return all available collections. The tool returns the complete collection dataset with all associated products, so use it for all collection-related queries.',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
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
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
): Promise<{tool_call_id: string; role: 'tool'; content: string}> {
  // Type guard for function tool calls
  if (toolCall.type !== 'function') {
    throw new Error(`Unsupported tool call type: ${toolCall.type}`);
  }

  const toolCallId = toolCall.id;
  const fn = toolCall.function;
  const {name, arguments: argsStr} = fn;

  // eslint-disable-next-line no-console
  console.log(`[Tool Execution] Starting tool: ${name}`, {
    toolCallId,
    arguments: argsStr,
  });

  // Check if storefront context is available
  if (!storefrontContext) {
    const error = 'Storefront context not available';
    console.error(`[Tool Execution] Error in ${name}:`, error);
    return {
      tool_call_id: toolCallId,
      role: 'tool' as const,
      content: `Error: ${error}`,
    };
  }

  let args: any;
  try {
    args = JSON.parse(argsStr);
    // eslint-disable-next-line no-console
    console.log(`[Tool Execution] Parsed arguments for ${name}:`, args);
  } catch (e) {
    const error = `Invalid JSON arguments for tool ${name}: ${argsStr}`;
    console.error(`[Tool Execution] Error parsing arguments:`, error);
    throw new Error(error);
  }

  try {
    // Execute tool based on name - using functions directly instead of API calls
    let result: string;
    const startTime = Date.now();

    if (name === 'get_product_data') {
      const searchQuery = args.searchQuery?.toLowerCase().trim() || '';

      // eslint-disable-next-line no-console
      console.log(
        `[Tool Execution] Fetching product data${searchQuery ? ` for query: ${searchQuery}` : ' (all products)'}`,
      );

      // Fetch all products directly using the function
      const products = await fetchAllProducts(storefrontContext);
      // eslint-disable-next-line no-console
      console.log(`[Tool Execution] Fetched ${products.length} products`);

      // If search query provided, filter products by name or description
      let filteredProducts = products;
      if (searchQuery) {
        filteredProducts = Array.isArray(products)
          ? products.filter(
              (p: any) =>
                p.title?.toLowerCase().includes(searchQuery) ||
                p.description?.toLowerCase().includes(searchQuery) ||
                p.handle?.toLowerCase().includes(searchQuery) ||
                p.tags?.some((tag: string) =>
                  tag.toLowerCase().includes(searchQuery),
                ),
            )
          : [];

        // eslint-disable-next-line no-console
        console.log(
          `[Tool Execution] Found ${filteredProducts.length} product(s) matching "${searchQuery}"`,
        );
      }

      if (filteredProducts.length === 0) {
        console.warn(
          `[Tool Execution] No products found${searchQuery ? ` matching "${searchQuery}"` : ''}`,
        );
        result = JSON.stringify(
          {
            message: searchQuery
              ? `No products found matching "${searchQuery}"`
              : 'No products available',
            totalProducts: products.length,
            searchQuery: searchQuery || null,
          },
          null,
          2,
        );
      } else {
        // Return all matching products (or all products if no search query)
        result = JSON.stringify(
          {
            products: filteredProducts,
            count: filteredProducts.length,
            totalProducts: products.length,
            searchQuery: searchQuery || null,
          },
          null,
          2,
        );
        // eslint-disable-next-line no-console
        console.log(
          `[Tool Execution] Returning ${filteredProducts.length} product(s)`,
        );
      }
    } else if (name === 'get_collection_data') {
      const searchQuery = args.searchQuery?.toLowerCase().trim() || '';

      // eslint-disable-next-line no-console
      console.log(
        `[Tool Execution] Fetching collection data${searchQuery ? ` for query: ${searchQuery}` : ' (all collections)'}`,
      );

      // Fetch all collections directly using the function
      const collections = await fetchAllCollections(storefrontContext);
      // eslint-disable-next-line no-console
      console.log(`[Tool Execution] Fetched ${collections.length} collections`);

      // If search query provided, filter collections by name or description
      let filteredCollections = collections;
      if (searchQuery) {
        filteredCollections = Array.isArray(collections)
          ? collections.filter(
              (c: any) =>
                c.title?.toLowerCase().includes(searchQuery) ||
                c.description?.toLowerCase().includes(searchQuery) ||
                c.handle?.toLowerCase().includes(searchQuery),
            )
          : [];

        // eslint-disable-next-line no-console
        console.log(
          `[Tool Execution] Found ${filteredCollections.length} collection(s) matching "${searchQuery}"`,
        );
      }

      if (filteredCollections.length === 0) {
        console.warn(
          `[Tool Execution] No collections found${searchQuery ? ` matching "${searchQuery}"` : ''}`,
        );
        result = JSON.stringify(
          {
            message: searchQuery
              ? `No collections found matching "${searchQuery}"`
              : 'No collections available',
            totalCollections: collections.length,
            searchQuery: searchQuery || null,
          },
          null,
          2,
        );
      } else {
        // Return all matching collections (or all collections if no search query)
        result = JSON.stringify(
          {
            collections: filteredCollections,
            count: filteredCollections.length,
            totalCollections: collections.length,
            searchQuery: searchQuery || null,
          },
          null,
          2,
        );
        // eslint-disable-next-line no-console
        console.log(
          `[Tool Execution] Returning ${filteredCollections.length} collection(s)`,
        );
      }
    } else {
      const error = `Unknown tool: ${name}`;
      console.error(`[Tool Execution] ${error}`);
      throw new Error(error);
    }

    const duration = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(`[Tool Execution] Completed ${name} in ${duration}ms`, {
      toolCallId,
      resultLength: result.length,
    });

    return {
      tool_call_id: toolCallId,
      role: 'tool' as const,
      content: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Tool Execution] Error in ${name}:`, {
      toolCallId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      tool_call_id: toolCallId,
      role: 'tool' as const,
      content: `Error: ${errorMessage}`,
    };
  }
}

// ----------------------
// Remix action with OpenAI streaming and tool support
// ----------------------
export async function action({request, context}: Route.ActionArgs) {
  try {
    const {env, storefront} = context;

    // Set global storefront context for tool execution
    storefrontContext = storefront;

    // Resolve API key
    const apiKey =
      env.OPENAI_API_KEY ||
      (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
      '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key is not configured',
          hint: 'Make sure OPENAI_API_KEY is set in your .env file and restart the dev server',
        }),
        {
          status: 500,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    const body = (await request.json()) as {
      messages?: Array<{role: string; content: string}>;
      chatId?: string | number;
    };

    const {messages, chatId} = body ?? {};

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({error: 'Messages array is required'}),
        {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Normalise roles and prepend Shopsy system prompt
    const userMessages = messages.map((msg) => ({
      role:
        msg.role === 'assistant'
          ? 'assistant'
          : msg.role === 'system'
            ? 'system'
            : msg.role === 'tool'
              ? 'tool'
              : 'user',
      content: msg.content,
      ...(msg.role === 'tool' && 'tool_call_id' in msg
        ? {tool_call_id: (msg as any).tool_call_id}
        : {}),
      ...(msg.role === 'assistant' && 'tool_calls' in msg
        ? {tool_calls: (msg as any).tool_calls}
        : {}),
    })) as Array<
      | {role: 'user' | 'system'; content: string}
      | {
          role: 'assistant';
          content: string | null;
          tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
        }
      | {role: 'tool'; content: string; tool_call_id: string}
    >;

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        {role: 'system' as const, content: SHOPSY_INSTRUCTIONS},
        ...userMessages,
      ];

    // Initialize OpenAI client (works in MiniOxygen / CF-style runtimes)
    const openai = new OpenAI({
      apiKey,
      fetch: globalThis.fetch,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const currentMessages = [...openaiMessages];
          const maxIterations = 10; // Prevent infinite loops
          let iteration = 0;

          while (iteration < maxIterations) {
            iteration++;

            // Send tool-call-start event if this is a tool iteration
            if (iteration > 1) {
              const toolStartEvent = `0:${JSON.stringify({
                type: 'tool-call-start',
              })}\n`;
              controller.enqueue(encoder.encode(toolStartEvent));
            }

            const completionStream = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: currentMessages,
              tools: TOOLS,
              tool_choice: 'auto', // Let the model decide when to use tools
              temperature: 0.7,
              max_tokens: 2000,
              stream: true,
            });

            const assistantMessage: {
              role: 'assistant';
              content: string | null;
              tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
            } = {
              role: 'assistant',
              content: null,
              tool_calls: [],
            };

            let hasToolCalls = false;

            for await (const chunk of completionStream) {
              const choice = chunk.choices[0];
              if (!choice) continue;

              // Handle content delta
              const contentDelta = choice.delta?.content;
              if (contentDelta) {
                if (assistantMessage.content === null) {
                  assistantMessage.content = '';
                }
                assistantMessage.content += contentDelta;

                // Stream content delta to client
                const eventData = {
                  type: 'text-delta',
                  textDelta: contentDelta,
                };
                const line = `0:${JSON.stringify(eventData)}\n`;
                controller.enqueue(encoder.encode(line));
              }

              // Handle tool calls
              const toolCallDelta = choice.delta?.tool_calls;
              if (toolCallDelta && toolCallDelta.length > 0) {
                hasToolCalls = true;
                for (const toolCall of toolCallDelta) {
                  const index = toolCall.index ?? 0;
                  if (!assistantMessage.tool_calls) {
                    assistantMessage.tool_calls = [];
                  }
                  if (!assistantMessage.tool_calls[index]) {
                    // Type guard: ensure it's a function tool call
                    if (toolCall.type === 'function' || !toolCall.type) {
                      assistantMessage.tool_calls[index] = {
                        id: toolCall.id || '',
                        type: 'function',
                        function: {
                          name: toolCall.function?.name || '',
                          arguments: toolCall.function?.arguments || '',
                        },
                      } as OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
                    }
                  } else {
                    const existingCall = assistantMessage.tool_calls[index];
                    if (
                      existingCall.type === 'function' &&
                      (toolCall.type === 'function' || !toolCall.type)
                    ) {
                      existingCall.function.arguments +=
                        toolCall.function?.arguments || '';
                    }
                  }
                }
              }
            }

            // Add assistant message to conversation
            if (
              assistantMessage.content ||
              assistantMessage.tool_calls?.length
            ) {
              currentMessages.push(assistantMessage);
            }

            // If no tool calls, we're done
            if (!hasToolCalls || !assistantMessage.tool_calls?.length) {
              // Finish event
              const finishEvent = `0:${JSON.stringify({type: 'finish'})}\n`;
              controller.enqueue(encoder.encode(finishEvent));
              controller.close();
              return;
            }

            // Execute tool calls
            // eslint-disable-next-line no-console
            console.log(
              `[Chat API] Executing ${assistantMessage.tool_calls.length} tool call(s)`,
            );
            const toolResults = await Promise.all(
              assistantMessage.tool_calls.map((toolCall) =>
                executeToolCall(toolCall),
              ),
            );
            // eslint-disable-next-line no-console
            console.log(
              `[Chat API] Completed ${toolResults.length} tool call(s)`,
            );

            // Add tool results to conversation
            for (const toolResult of toolResults) {
              currentMessages.push(toolResult);
            }

            // Send tool-call-complete event
            const toolCompleteEvent = `0:${JSON.stringify({
              type: 'tool-call-complete',
              toolCalls: assistantMessage.tool_calls
                .filter((tc) => tc.type === 'function')
                .map((tc) => ({
                  id: tc.id,
                  name: tc.type === 'function' ? tc.function.name : 'unknown',
                })),
            })}\n`;
            controller.enqueue(encoder.encode(toolCompleteEvent));

            // Continue loop to get final response
          }

          // If we hit max iterations, close the stream
          const finishEvent = `0:${JSON.stringify({
            type: 'finish',
            warning: 'Maximum tool call iterations reached',
          })}\n`;
          controller.enqueue(encoder.encode(finishEvent));
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          const errorEvent = `0:${JSON.stringify({
            type: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          })}\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }
}
