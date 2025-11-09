import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {ShoppingBag, ArrowRight, Sparkles} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details flex flex-col gap-6">
        <div aria-labelledby="cart-lines" className="flex-1">
          <ul className="space-y-4">
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  return (
    <div 
      hidden={hidden}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="p-6 rounded-full bg-muted/50">
          <ShoppingBag className="size-12 text-muted-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Looks like you haven&rsquo;t added anything yet. Let&rsquo;s get you started with some amazing products!
      </p>
      <Button asChild className="gap-2">
        <Link to="/collections" prefetch="viewport">
          Start Shopping
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      <div className="mt-8 pt-8 border-t w-full max-w-sm">
        <p className="text-sm text-muted-foreground mb-4">✨ Why shop with us?</p>
        <div className="grid grid-cols-1 gap-3 text-left">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10 mt-0.5">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10 mt-0.5">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">30-day return policy</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10 mt-0.5">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Checkout</p>
              <p className="text-xs text-muted-foreground">Your data is protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
