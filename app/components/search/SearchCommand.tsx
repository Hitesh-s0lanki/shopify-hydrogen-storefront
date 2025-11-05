import {useNavigate} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useEffect, useState, useRef} from 'react';
import {useFetcher} from 'react-router';
import {
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
      shouldFilter={false}
      value={searchTerm}
      onValueChange={setSearchTerm}
    >
      <CommandInput
        placeholder="Search for products, collections, and more..."
      />
      <CommandList>
        {fetcher.state === 'loading' && searchTerm.trim() && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">Loading...</div>
          </div>
        )}

        {fetcher.state !== 'loading' && !total && searchTerm.trim() && (
          <CommandEmpty>
            No results found for <q>{searchTerm}</q>
          </CommandEmpty>
        )}

        {fetcher.state !== 'loading' && total > 0 && (
          <>
            {products.length > 0 && (
              <CommandGroup heading="Products">
                {products.map((product) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term: searchTerm,
                  });

                  const price = product?.selectedOrFirstAvailableVariant?.price;
                  const image = product?.selectedOrFirstAvailableVariant?.image;

                  return (
                    <CommandItem
                      key={product.id}
                      value={product.title}
                      onSelect={() => handleSelect(productUrl)}
                      className="flex items-center gap-3"
                    >
                      {image && (
                        <Image
                          alt={image.altText ?? ''}
                          src={image.url}
                          width={40}
                          height={40}
                          className="rounded-md shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{product.title}</p>
                        {price && (
                          <small className="text-muted-foreground">
                            <Money data={price} />
                          </small>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {collections.length > 0 && (
              <CommandGroup heading="Collections">
                {collections.map((collection) => {
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
                      className="flex items-center gap-3"
                    >
                      {collection.image?.url && (
                        <Image
                          alt={collection.image.altText ?? ''}
                          src={collection.image.url}
                          width={40}
                          height={40}
                          className="rounded-md shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{collection.title}</p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {pages.length > 0 && (
              <CommandGroup heading="Pages">
                {pages.map((page) => {
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
                    >
                      {page.title}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {articles.length > 0 && (
              <CommandGroup heading="Articles">
                {articles.map((article) => {
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
                      className="flex items-center gap-3"
                    >
                      {article.image?.url && (
                        <Image
                          alt={article.image.altText ?? ''}
                          src={article.image.url}
                          width={40}
                          height={40}
                          className="rounded-md shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{article.title}</p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {searchTerm.trim() && total > 0 && (
              <div className="border-t p-2">
                <CommandItem
                  onSelect={handleViewAll}
                  className="text-primary font-medium cursor-pointer"
                >
                  View all {total} results for &quot;{searchTerm}&quot; →
                </CommandItem>
              </div>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

