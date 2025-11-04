import {Suspense} from 'react';
import {Await} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {CartMain} from '~/components/CartMain';

interface CartSheetProps {
  cart: Promise<CartApiQueryFragment | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({cart, open, onOpenChange}: CartSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Suspense fallback={<div className="p-4">Loading cart...</div>}>
            <Await resolve={cart}>
              {(cartData) => <CartMain cart={cartData} layout="aside" />}
            </Await>
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
}
