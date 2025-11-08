import OpenAI from 'openai';
import type {Route} from './+types/api.chat';

export async function action({request, context}: Route.ActionArgs) {
  try {
    const {env} = context;

    // Get OpenAI API key from environment
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
    const {messages, chatId} = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({error: 'Messages array is required'}),
        {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        },
      );
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map((msg) => ({
      role:
        msg.role === 'assistant'
          ? 'assistant'
          : msg.role === 'system'
            ? 'system'
            : 'user',
      content: msg.content,
    })) as Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
      // Use fetch from global scope (works in Cloudflare Workers)
      fetch: globalThis.fetch,
    });

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create streaming chat completion
          const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: openaiMessages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true,
          });

          // Process the stream
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              // Send text-delta event in Vercel AI SDK data stream format
              const eventData = {
                type: 'text-delta',
                textDelta: delta,
              };
              const event = `0:${JSON.stringify(eventData)}\n`;
              controller.enqueue(encoder.encode(event));
            }
          }

          // Send finish event
          const finishEvent = `0:${JSON.stringify({type: 'finish'})}\n`;
          controller.enqueue(encoder.encode(finishEvent));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
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
