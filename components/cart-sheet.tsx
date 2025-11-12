"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { Cart, CartLine } from "@/modules/cart/types";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const router = useRouter();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [updatingLines, setUpdatingLines] = React.useState<Set<string>>(
    new Set()
  );

  // Fetch cart on open
  React.useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  // Listen for cart updates
  React.useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      const data = await response.json();
      setCart(data.cart || null);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) {
      await removeLine(lineId);
      return;
    }

    setUpdatingLines((prev) => new Set(prev).add(lineId));
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          lineId,
          quantity,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        console.error("Failed to update cart:", data.error || "Unknown error");
        return;
      }
      if (data.cart) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setUpdatingLines((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }
  };

  const removeLine = async (lineId: string) => {
    setUpdatingLines((prev) => new Set(prev).add(lineId));
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          lineId,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        console.error("Failed to remove cart line:", data.error || "Unknown error");
        return;
      }
      if (data.cart) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Failed to remove cart line:", error);
    } finally {
      setUpdatingLines((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  const isEmpty = !cart || cart.lines.nodes.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {cart && cart.totalQuantity > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start shopping to add items to your cart
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/collections");
                }}
              >
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {cart.lines.nodes.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  onUpdateQuantity={(quantity) =>
                    updateQuantity(line.id, quantity)
                  }
                  onRemove={() => removeLine(line.id)}
                  isUpdating={updatingLines.has(line.id)}
                />
              ))}
            </div>
          )}
        </div>

        {!isEmpty && cart && (
          <SheetFooter className="flex-col gap-4 border-t pt-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(cart.cost.subtotalAmount)}
                </span>
              </div>
              {cart.cost.totalTaxAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    {formatMoney(cart.cost.totalTaxAmount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(cart.cost.totalAmount)}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isEmpty}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/cart");
                }}
              >
                View Full Cart
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLineItem({
  line,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}: {
  line: CartLine;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
}) {
  const { merchandise, quantity, cost } = line;
  const image = merchandise.image;

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      {image && (
        <Link
          href={`/products/${merchandise.product.handle}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
          onClick={(e) => {
            // Allow navigation but prevent sheet from closing
            e.stopPropagation();
          }}
        >
          <Image
            src={image.url}
            alt={image.altText || merchandise.product.title}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </Link>
      )}
      {!image && (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${merchandise.product.handle}`}
              className="font-medium hover:text-primary transition-colors line-clamp-2"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {merchandise.product.title}
            </Link>
            {merchandise.title !== "Default Title" && (
              <p className="text-sm text-muted-foreground">
                {merchandise.title}
              </p>
            )}
            {merchandise.selectedOptions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {merchandise.selectedOptions.map((option) => (
                  <span
                    key={option.name}
                    className="text-xs text-muted-foreground"
                  >
                    {option.name}: {option.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                quantity
              )}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-right">
            {merchandise.compareAtPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatMoney(merchandise.compareAtPrice)}
              </p>
            )}
            <p className="font-semibold">
              {formatMoney(cost.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

