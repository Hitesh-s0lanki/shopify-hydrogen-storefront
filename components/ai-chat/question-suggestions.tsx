"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles } from "lucide-react";
import type { QuestionSuggestionsProps } from "./types";

export function QuestionSuggestions({
  suggestions,
  onSelect,
  isLoading,
}: QuestionSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
          <Lightbulb className="h-3 w-3 text-emerald-500" />
        </div>
        <span>Try asking:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto min-h-[2.5rem] py-2 px-3 text-left justify-start text-xs font-normal hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-800 transition-all group"
            onClick={() => onSelect(suggestion)}
            disabled={isLoading}
          >
            <Sparkles className="h-3 w-3 mr-2 text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
            <span className="line-clamp-2">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

