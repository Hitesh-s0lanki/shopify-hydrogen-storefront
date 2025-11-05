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
        side="bottom" 
        className="w-full h-[60vh] max-h-[60vh] flex flex-col p-0 rounded-t-2xl"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full"></div>
        </div>
        
        <SheetHeader className="px-6 pt-2 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingBag className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold">Your Shopping Cart</SheetTitle>
              <SheetDescription className="text-sm mt-1">
                Review your items and proceed to checkout when you're ready
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
