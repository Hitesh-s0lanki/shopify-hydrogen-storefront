import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {ShoppingCart, Check, Loader2} from 'lucide-react';
import {cn} from '~/lib/utils';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
  variant = 'default',
  showIcon = true,
}: {
  analytics?: unknown;
  children?: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'large' | 'compact';
  showIcon?: boolean;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isSubmitting = fetcher.state !== 'idle';
        const isDisabled = disabled ?? isSubmitting;
        const isSuccess = fetcher.data && !fetcher.formData;

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={isDisabled}
              className={cn(
                'group relative w-full overflow-hidden rounded-lg font-semibold transition-all duration-300',
                'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground',
                'hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-xl',
                'active:scale-[0.98] disabled:scale-100',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                variant === 'large' && 'h-14 text-base px-6',
                variant === 'default' && 'h-12 text-base px-5',
                variant === 'compact' && 'h-10 text-sm px-4',
                className
              )}
            >
              {/* Shimmer effect on hover */}
              <span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                         group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
              />

              {/* Content */}
              <span className="relative flex items-center justify-center gap-2.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Adding to cart...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="size-5 animate-in zoom-in duration-200" />
                    <span>Added to cart!</span>
                  </>
                ) : (
                  <>
                    {showIcon && (
                      <ShoppingCart className="size-5 transition-transform group-hover:scale-110" />
                    )}
                    <span>{children || 'Add to Cart'}</span>
                  </>
                )}
              </span>

              {/* Ripple effect on click */}
              <span className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-100 group-active:bg-white/20 transition-opacity duration-200" />
            </button>
          </>
        );
      }}
    </CartForm>
  );
}
