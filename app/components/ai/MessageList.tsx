import {Loader2, Bot, User, Sparkles, Lightbulb, ShoppingBag, HelpCircle, Search} from 'lucide-react';
import type {Message} from './ChatComponent';

type Props = {
  messages: Message[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: string) => void;
};

export function MessageList({messages, isLoading}: Props) {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg animate-pulse" />
          <div className="relative flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Connecting to AI...</p>
      </div>
    );
  }

  const suggestions = [
    {
      icon: ShoppingBag,
      text: 'What products do you recommend?',
      category: 'Shopping',
    },
    {
      icon: Search,
      text: 'Help me find the perfect gift',
      category: 'Search',
    },
    {
      icon: HelpCircle,
      text: 'How do I track my order?',
      category: 'Support',
    },
    {
      icon: Lightbulb,
      text: 'What are your best deals today?',
      category: 'Deals',
    },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="relative flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/20">
            <Sparkles className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Start a conversation
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Ask me anything! I'm here to help you with questions, suggestions, and more.
          </p>
        </div>

        {/* Suggestion Messages */}
        <div className="w-full max-w-md space-y-3 mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Try asking:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion.text)}
                  className="group relative flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200 text-left hover:shadow-md hover:shadow-emerald-500/10"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-green-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:via-green-500/5 group-hover:to-teal-500/5 rounded-xl transition-all duration-200" />
                  
                  {/* Icon */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-lg blur-sm group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {suggestion.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {suggestion.category}
                    </p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="h-4 w-4 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {/* Avatar for assistant messages */}
          {message.role === 'assistant' && (
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm" />
              <div className="relative flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30">
                <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
          )}

          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-muted/80 backdrop-blur-sm border border-emerald-500/10 text-foreground'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>

          {/* Avatar for user messages */}
          {message.role === 'user' && (
            <div className="relative shrink-0">
              <div className="relative flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-emerald-500/30 via-green-500/30 to-teal-500/30 border border-emerald-500/40">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm" />
            <div className="relative flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30">
              <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className="bg-muted/80 backdrop-blur-sm border border-emerald-500/10 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-xs text-muted-foreground">AI is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

