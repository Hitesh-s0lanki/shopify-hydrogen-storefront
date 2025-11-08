import {Suspense} from 'react';
import {Await} from 'react-router';
import {ShoppingBag} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
      <SheetContent
        side="right"
        className="min-w-[500px] flex flex-col p-0 rounded-l-2xl"
      >
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingBag className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold">
                Your Shopping Cart
              </SheetTitle>
              <SheetDescription className="text-xs">
                Review your items and proceed to checkout when you&apos;re ready
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading your cart...</p>
              </div>
            }
          >
            <Await resolve={cart}>
              {(cartData) => <CartMain cart={cartData} layout="aside" />}
            </Await>
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
}
