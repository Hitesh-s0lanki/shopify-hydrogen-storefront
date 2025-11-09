import {Suspense} from 'react';
import {Await} from 'react-router';
import {ShoppingCart} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {CartBadgeContent} from './CartBadgeContent';

interface CartHeaderButtonProps {
  cart: Promise<CartApiQueryFragment | null>;
  onCartOpen: () => void;
}

export function CartHeaderButton({
  cart,
  onCartOpen,
}: CartHeaderButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCartOpen}
      className="relative"
    >
      <ShoppingCart className="size-4" />
      <Suspense>
        <Await resolve={cart}>
          <CartBadgeContent />
        </Await>
      </Suspense>
      <span className="sr-only">Cart</span>
    </Button>
  );
}

