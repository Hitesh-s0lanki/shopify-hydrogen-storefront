import {useState, useEffect, useRef} from 'react';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {Send, Sparkles, Bot, Loader2} from 'lucide-react';
import {MessageList} from './MessageList';

// Custom stream parser for Vercel AI SDK data stream format
async function* parseDataStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{type: string; textDelta?: string}, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, {stream: true});
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        // Format: "0:{"type":"text-delta","textDelta":"..."}"
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const jsonStr = line.slice(colonIndex + 1);
        try {
          const data = JSON.parse(jsonStr);
          if (data.type === 'text-delta' && data.textDelta) {
            yield {type: 'text-delta', textDelta: data.textDelta};
          } else if (data.type === 'finish') {
            yield {type: 'finish'};
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const colonIndex = buffer.indexOf(':');
      if (colonIndex !== -1) {
        const jsonStr = buffer.slice(colonIndex + 1);
        try {
          const data = JSON.parse(jsonStr);
          if (data.type === 'text-delta' && data.textDelta) {
            yield {type: 'text-delta', textDelta: data.textDelta};
          } else if (data.type === 'finish') {
            yield {type: 'finish'};
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type Props = {
  chatId?: number | string;
  apiEndpoint?: string;
  getMessagesEndpoint?: string;
};

export function ChatComponent({
  chatId,
  apiEndpoint = '/api/chat',
  getMessagesEndpoint = '/api/get-messages',
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (chatId && getMessagesEndpoint) {
      setIsLoadingMessages(true);
      fetch(getMessagesEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({chatId}),
      })
        .then((res) => res.json())
        .then((data: Message[]) => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch((error) => {
          console.error('Error loading messages:', error);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    }
  }, [chatId, getMessagesEndpoint]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          chatId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      let fullContent = '';
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      for await (const chunk of parseDataStream(response.body)) {
        if (chunk.type === 'text-delta' && chunk.textDelta) {
          fullContent += chunk.textDelta;
          // Update the assistant message with streaming content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {...msg, content: fullContent}
                : msg,
            ),
          );
          // Auto-scroll during streaming
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
              top: scrollAreaRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        } else if (chunk.type === 'finish') {
          // Streaming complete
          break;
        }
      }

      // Final update to ensure all content is saved
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {...msg, content: fullContent || 'No response received'}
            : msg,
        ),
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the empty assistant message and add error message
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId),
      );
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden bg-gradient-to-b from-background via-emerald-50/5 to-background dark:via-emerald-950/5"
      id="message-container"
      ref={messageContainerRef}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(16,185,129)_1px,transparent_0)] bg-[length:30px_30px]" />
      </div>

      {/* message list - scrollable area */}
      <div ref={scrollAreaRef} className="relative flex-1 overflow-y-auto min-h-0">
        <MessageList 
          messages={messages} 
          isLoading={isLoadingMessages || isLoading}
          onSuggestionClick={(suggestion) => {
            setInput(suggestion);
            // Auto-focus input after setting suggestion
            setTimeout(() => {
              const inputElement = document.querySelector('input[placeholder="Ask any question..."]') as HTMLInputElement;
              inputElement?.focus();
            }, 0);
          }}
        />
      </div>

      {/* Enhanced Input Area */}
      <form
        onSubmit={handleSubmit}
        className="relative sticky bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-transparent border-t border-emerald-500/10 z-10 shrink-0"
      >
        {/* Glow effect at top of input area */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        <div className="flex gap-2 items-end">
          <div className="relative flex-1">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-lg blur-sm" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any question..."
              className="relative w-full border-emerald-500/20 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20 bg-background/80 backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

