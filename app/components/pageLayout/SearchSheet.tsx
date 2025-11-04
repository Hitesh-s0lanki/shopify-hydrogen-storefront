import {Link} from 'react-router';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({open, onOpenChange}: SearchSheetProps) {
  const queriesDatalistId = 'search-queries';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Search Products</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <SearchFormPredictive>
            {({fetchResults, goToSearch, inputRef}) => (
              <div className="flex gap-2">
                <Input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder="Search for products, collections, and more..."
                  ref={inputRef}
                  type="search"
                  list={queriesDatalistId}
                  className="flex-1"
                />
                <Button onClick={goToSearch} type="button">
                  Search
                </Button>
              </div>
            )}
          </SearchFormPredictive>

          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              if (state === 'loading' && term.current) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                );
              }

              if (!total) {
                return (
                  <div className="py-8 text-center text-muted-foreground">
                    <SearchResultsPredictive.Empty term={term} />
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                  />
                  <div className="grid gap-4">
                    {products.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Products</h3>
                        <SearchResultsPredictive.Products
                          products={products}
                          closeSearch={() => {
                            closeSearch();
                            onOpenChange(false);
                          }}
                          term={term}
                        />
                      </div>
                    )}
                    {collections.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Collections</h3>
                        <SearchResultsPredictive.Collections
                          collections={collections}
                          closeSearch={() => {
                            closeSearch();
                            onOpenChange(false);
                          }}
                          term={term}
                        />
                      </div>
                    )}
                    {pages.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Pages</h3>
                        <SearchResultsPredictive.Pages
                          pages={pages}
                          closeSearch={() => {
                            closeSearch();
                            onOpenChange(false);
                          }}
                          term={term}
                        />
                      </div>
                    )}
                    {articles.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Articles</h3>
                        <SearchResultsPredictive.Articles
                          articles={articles}
                          closeSearch={() => {
                            closeSearch();
                            onOpenChange(false);
                          }}
                          term={term}
                        />
                      </div>
                    )}
                  </div>
                  {term.current && total > 0 && (
                    <div className="pt-4">
                      <Link
                        onClick={() => {
                          closeSearch();
                          onOpenChange(false);
                        }}
                        to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                        className="text-primary hover:underline"
                      >
                        View all {total} results for &quot;{term.current}&quot;
                        &nbsp; →
                      </Link>
                    </div>
                  )}
                </div>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </SheetContent>
    </Sheet>
  );
}

