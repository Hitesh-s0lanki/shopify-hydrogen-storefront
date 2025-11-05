import {useNavigate, useFetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useEffect, useState, useRef} from 'react';
import {Package, Layers} from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {SEARCH_ENDPOINT} from './SearchFormPredictive';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default suggestions when search dialog opens
const DEFAULT_SUGGESTIONS = [
  {
    id: 'products',
    title: 'View All Products',
    url: '/products',
    icon: Package,
    description: 'Browse all products',
  },
  {
    id: 'collections',
    title: 'View All Collections',
    url: '/collections',
    icon: Layers,
    description: 'Explore all collections',
  },
] as const;

export function SearchCommand({open, onOpenChange}: SearchCommandProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset search term when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  // Fetch search results when search term changes (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      // Debounce the search to avoid too many requests
      searchTimeoutRef.current = setTimeout(() => {
        void fetcher.submit(
          {q: searchTerm.trim(), limit: 5, predictive: true},
          {method: 'GET', action: SEARCH_ENDPOINT},
        );
      }, 300);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  const {articles, collections, pages, products} = items;

  const hasSearchTerm = searchTerm.trim().length > 0;
  const isLoading = fetcher.state === 'loading' && hasSearchTerm;
  const hasResults = total > 0 && !isLoading;
  const showDefaultSuggestions = !hasSearchTerm && !isLoading;

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setSearchTerm('');
    void navigate(url);
  };

  const handleViewAll = () => {
    if (searchTerm.trim()) {
      onOpenChange(false);
      const url = `${SEARCH_ENDPOINT}?q=${encodeURIComponent(searchTerm.trim())}`;
      setSearchTerm('');
      void navigate(url);
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Products"
      description="Search for products, collections, and more..."
    >
      <Command
        shouldFilter={false}
        value={searchTerm}
        onValueChange={setSearchTerm}
      >
        <CommandInput placeholder="Search for products, collections, and more..." />
        <CommandList>
          {/* Default Suggestions - Show when no search term */}
          {showDefaultSuggestions && (
            <CommandGroup heading="Quick Actions">
              {DEFAULT_SUGGESTIONS.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <CommandItem
                    key={suggestion.id}
                    value={suggestion.title}
                    onSelect={() => handleSelect(suggestion.url)}
                    className="flex items-center gap-3 py-3"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <div className="text-muted-foreground text-sm">
                  Searching...
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && hasSearchTerm && !hasResults && (
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for{' '}
                  <q className="font-medium">{searchTerm}</q>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Search Results */}
          {hasResults && (
            <>
              {products.length > 0 && (
                <CommandGroup heading="Products">
                  {products.map((product: (typeof products)[0]) => {
                    const productUrl = urlWithTrackingParams({
                      baseUrl: `/products/${product.handle}`,
                      trackingParams: product.trackingParameters,
                      term: searchTerm,
                    });

                    const price =
                      product?.selectedOrFirstAvailableVariant?.price;
                    const image =
                      product?.selectedOrFirstAvailableVariant?.image;

                    return (
                      <CommandItem
                        key={product.id}
                        value={product.title}
                        onSelect={() => handleSelect(productUrl)}
                        className="flex items-center gap-3 py-3"
                      >
                        {image ? (
                          <Image
                            alt={image.altText ?? ''}
                            src={image.url}
                            width={48}
                            height={48}
                            className="rounded-md shrink-0 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {product.title}
                          </p>
                          {price && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              <Money data={price} />
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {collections.length > 0 && (
                <CommandGroup heading="Collections">
                  {collections.map((collection: (typeof collections)[0]) => {
                    const collectionUrl = urlWithTrackingParams({
                      baseUrl: `/collections/${collection.handle}`,
                      trackingParams: collection.trackingParameters,
                      term: searchTerm,
                    });

                    return (
                      <CommandItem
                        key={collection.id}
                        value={collection.title}
                        onSelect={() => handleSelect(collectionUrl)}
                        className="flex items-center gap-3 py-3"
                      >
                        {collection.image?.url ? (
                          <Image
                            alt={collection.image.altText ?? ''}
                            src={collection.image.url}
                            width={48}
                            height={48}
                            className="rounded-md shrink-0 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <Layers className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {collection.title}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {pages.length > 0 && (
                <CommandGroup heading="Pages">
                  {pages.map((page: (typeof pages)[0]) => {
                    const pageUrl = urlWithTrackingParams({
                      baseUrl: `/pages/${page.handle}`,
                      trackingParams: page.trackingParameters,
                      term: searchTerm,
                    });

                    return (
                      <CommandItem
                        key={page.id}
                        value={page.title}
                        onSelect={() => handleSelect(pageUrl)}
                        className="py-3"
                      >
                        <p className="font-medium">{page.title}</p>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {articles.length > 0 && (
                <CommandGroup heading="Articles">
                  {articles.map((article: (typeof articles)[0]) => {
                    const articleUrl = urlWithTrackingParams({
                      baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
                      trackingParams: article.trackingParameters,
                      term: searchTerm,
                    });

                    return (
                      <CommandItem
                        key={article.id}
                        value={article.title}
                        onSelect={() => handleSelect(articleUrl)}
                        className="flex items-center gap-3 py-3"
                      >
                        {article.image?.url ? (
                          <Image
                            alt={article.image.altText ?? ''}
                            src={article.image.url}
                            width={48}
                            height={48}
                            className="rounded-md shrink-0 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {article.title}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* View All Results */}
              {hasSearchTerm && total > 0 && (
                <div className="border-t my-1">
                  <CommandItem
                    onSelect={handleViewAll}
                    className="text-primary font-medium cursor-pointer py-3"
                  >
                    <span>
                      View all {total} result{total !== 1 ? 's' : ''} for &quot;
                      {searchTerm}&quot; →
                    </span>
                  </CommandItem>
                </div>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
