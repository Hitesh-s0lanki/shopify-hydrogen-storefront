"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Package,
  FileText,
  BookOpen,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { SearchProduct, SearchPage, SearchArticle } from "@/modules/search/types";
import Image from "next/image";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// AI-powered query enhancement
function enhanceQuery(query: string): string {
  // AI-like query enhancement and normalization
  // In production, this could use an LLM API (OpenAI, Anthropic, etc.)
  const lowerQuery = query.toLowerCase().trim();
  
  if (lowerQuery.length < 2) return query;
  
  // Remove common stop words for better matching
  const stopWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"];
  const words = lowerQuery.split(/\s+/).filter(word => !stopWords.includes(word));
  
  // Enhance product searches with synonyms
  const productSynonyms: Record<string, string[]> = {
    "shoes": ["footwear", "sneakers", "boots"],
    "shirt": ["top", "tee", "t-shirt"],
    "pants": ["trousers", "jeans"],
  };
  
  // Check for synonyms and expand query
  let enhancedWords = words;
  words.forEach(word => {
    Object.entries(productSynonyms).forEach(([key, synonyms]) => {
      if (word === key || synonyms.includes(word)) {
        enhancedWords = [...enhancedWords, key, ...synonyms];
      }
    });
  });
  
  // Remove duplicates and return
  const uniqueWords = Array.from(new Set(enhancedWords));
  return uniqueWords.join(" ");
}

// Intelligent query categorization
function categorizeQuery(query: string): "product" | "page" | "article" | "general" {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("blog") || lowerQuery.includes("article") || lowerQuery.includes("post")) {
    return "article";
  }
  
  if (lowerQuery.includes("page") || lowerQuery.includes("about") || lowerQuery.includes("contact")) {
    return "page";
  }
  
  // Default to product search
  return "product";
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);
  const [results, setResults] = React.useState<{
    products: SearchProduct[];
    pages: SearchPage[];
    articles: SearchArticle[];
  }>({
    products: [],
    pages: [],
    articles: [],
  });
  const [predictiveSuggestions, setPredictiveSuggestions] = React.useState<{
    products: Array<{
      id: string;
      title: string;
      handle: string;
      selectedOrFirstAvailableVariant?: {
        id: string;
        image?: {
          url: string;
          altText: string | null;
          width: number | null;
          height: number | null;
        } | null;
        price: {
          amount: string;
          currencyCode: string;
        };
      } | null;
    }>;
    collections: Array<{
      id: string;
      title: string;
      handle: string;
      image?: {
        url: string;
        altText: string | null;
        width: number | null;
        height: number | null;
      } | null;
    }>;
    queries: Array<{
      text: string;
      styledText: string;
    }>;
  }>({
    products: [],
    collections: [],
    queries: [],
  });
  const [isSearching, setIsSearching] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Load recent searches from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = React.useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [
      query,
      ...recentSearches.filter((s) => s !== query),
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem("recent-searches", JSON.stringify(updated));
  }, [recentSearches]);

  // Predictive search for quick suggestions (AI-powered)
  React.useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setPredictiveSuggestions({ products: [], collections: [], queries: [] });
      setResults({ products: [], pages: [], articles: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // First, get predictive suggestions (faster, AI-powered)
        const predictiveResponse = await fetch(
          `/api/search/predictive?q=${encodeURIComponent(search)}&limit=3`
        );
        
        if (predictiveResponse.ok) {
          const predictive = await predictiveResponse.json();
          setPredictiveSuggestions(predictive);
        }

        // Then, get full search results
        setIsSearching(true);
        const enhancedQuery = enhanceQuery(search);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(enhancedQuery)}&first=5`
        );
        
        if (!response.ok) {
          throw new Error("Search failed");
        }
        
        const searchResults = await response.json();
        
        setResults({
          products: searchResults.products?.nodes || [],
          pages: searchResults.pages?.nodes || [],
          articles: searchResults.articles?.nodes || [],
        });
      } catch (error) {
        console.error("Search error:", error);
        setResults({ products: [], pages: [], articles: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSelect = React.useCallback((url: string, query?: string) => {
    if (query) {
      saveRecentSearch(query);
    }
    onOpenChange(false);
    router.push(url);
    setSearch("");
  }, [onOpenChange, router, saveRecentSearch]);

  const handleSearch = React.useCallback(() => {
    if (!search.trim()) return;
    saveRecentSearch(search);
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(search)}`);
    setSearch("");
  }, [search, onOpenChange, router, saveRecentSearch]);

  const totalResults = results.products.length + results.pages.length + results.articles.length;
  const hasPredictiveResults = 
    predictiveSuggestions.products.length > 0 ||
    predictiveSuggestions.collections.length > 0 ||
    predictiveSuggestions.queries.length > 0;
  const hasResults = totalResults > 0;
  const showRecentSearches = !search && recentSearches.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search products, pages, and articles with AI assistance"
      className="max-w-2xl"
    >
      <CommandInput
        placeholder="Search with AI assistance... (Press ⌘K to open)"
        value={search}
        onValueChange={setSearch}
        onKeyDown={(e) => {
          if (e.key === "Enter" && search.trim()) {
            handleSearch();
          }
          if (e.key === "Escape") {
            onOpenChange(false);
          }
        }}
      />
      <CommandList>
        {isSearching && search && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>AI is searching...</span>
            </div>
          </div>
        )}

        {!isSearching && !hasResults && search && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{search}&quot;
              </p>
              <button
                onClick={handleSearch}
                className="mt-2 text-sm text-primary hover:underline"
              >
                View all search results
              </button>
            </div>
          </CommandEmpty>
        )}

        {showRecentSearches && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((recent) => (
                <CommandItem
                  key={recent}
                  onSelect={() => {
                    setSearch(recent);
                    handleSelect(`/search?q=${encodeURIComponent(recent)}`, recent);
                  }}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{recent}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* AI-Powered Predictive Suggestions */}
        {hasPredictiveResults && search && !isSearching && totalResults === 0 && (
          <>
            {predictiveSuggestions.queries.length > 0 && (
              <CommandGroup heading="AI Suggestions">
                {predictiveSuggestions.queries.map((query, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      setSearch(query.text);
                      handleSelect(`/search?q=${encodeURIComponent(query.text)}`, query.text);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span dangerouslySetInnerHTML={{ __html: query.styledText }} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {predictiveSuggestions.collections.length > 0 && (
              <>
                {predictiveSuggestions.queries.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Collections">
                  {predictiveSuggestions.collections.map((collection) => (
                    <CommandItem
                      key={collection.id}
                      onSelect={() => handleSelect(`/collections/${collection.handle}`)}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{collection.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {predictiveSuggestions.products.length > 0 && (
              <>
                {(predictiveSuggestions.queries.length > 0 || predictiveSuggestions.collections.length > 0) && (
                  <CommandSeparator />
                )}
                <CommandGroup heading="Products">
                  {predictiveSuggestions.products.map((product) => {
                    const variant = product.selectedOrFirstAvailableVariant;
                    return (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelect(`/products/${product.handle}`)}
                        className="flex items-center gap-3 p-3"
                      >
                        {variant?.image && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={variant.image.url}
                              alt={variant.image.altText || product.title}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        {!variant?.image && (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <span className="truncate text-sm">{product.title}</span>
                          {variant && (
                            <span className="text-xs text-muted-foreground">
                              {formatMoney(variant.price)}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </>
        )}

        {hasResults && !isSearching && (
          <>
            {/* Products */}
            {results.products.length > 0 && (
              <>
                <CommandGroup heading="Products">
                  {results.products.map((product) => {
                    const variant = product.selectedOrFirstAvailableVariant;
                    if (!variant) return null;

                    return (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelect(`/products/${product.handle}`)}
                        className="flex items-center gap-3 p-3"
                      >
                        {variant.image && (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={variant.image.url}
                              alt={variant.image.altText || product.title}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        {!variant.image && (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <span className="truncate font-medium">{product.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatMoney(variant.price)}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {results.pages.length > 0 || results.articles.length > 0 ? (
                  <CommandSeparator />
                ) : null}
              </>
            )}

            {/* Pages */}
            {results.pages.length > 0 && (
              <>
                <CommandGroup heading="Pages">
                  {results.pages.map((page) => (
                    <CommandItem
                      key={page.id}
                      onSelect={() => handleSelect(`/pages/${page.handle}`)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{page.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {results.articles.length > 0 && <CommandSeparator />}
              </>
            )}

            {/* Articles */}
            {results.articles.length > 0 && (
              <CommandGroup heading="Articles">
                {results.articles.map((article) => (
                  <CommandItem
                    key={article.id}
                    onSelect={() =>
                      handleSelect(
                        `/blogs/${article.blog.handle}/${article.handle}`
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{article.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* View All Results */}
            {search && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleSearch}
                    className="flex items-center justify-center gap-2 font-medium"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>View all results for &quot;{search}&quot;</span>
                    <ArrowRight className="h-4 w-4" />
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}

        {/* Quick Actions */}
        {!search && !showRecentSearches && (
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => handleSelect("/collections")}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Browse Collections</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/products")}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>View All Products</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/collections/all")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>All Products</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

