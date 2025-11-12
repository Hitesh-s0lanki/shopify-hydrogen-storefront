import type { SearchProduct } from "@/modules/search/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: SearchProduct[];
}

export interface AiChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface MessageBodyProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  onSuggestionSelect?: (suggestion: string) => void;
}

export interface SendMessageProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (message?: string) => void;
  isLoading: boolean;
}

export interface QuestionSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading: boolean;
}

