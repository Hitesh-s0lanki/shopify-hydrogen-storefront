"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddToCartButtonProps {
  variantId?: string;
  quantity?: number;
  disabled?: boolean;
  variant?: "default" | "large";
  children?: React.ReactNode;
  onClick?: () => void;
  onAddToCart?: () => void;
}

export function AddToCartButton({
  variantId,
  quantity = 1,
  disabled = false,
  variant = "default",
  children,
  onClick,
  onAddToCart,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (disabled || isLoading) return;

    if (onClick) {
      await onClick();
      return;
    }

    if (!variantId) {
      toast.error("Please select a variant");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          variantId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMessage = data.error || `Failed to add to cart (${response.status})`;
        toast.error(errorMessage);
        console.error("Add to cart error:", errorMessage, data);
        return;
      }

      if (data.cart) {
        toast.success("Added to cart!");
        if (onAddToCart) {
          onAddToCart();
        }
        // Trigger cart update event for cart sheet and header
        window.dispatchEvent(new CustomEvent("cart-updated"));
        // Refresh the page data if needed
        router.refresh();
      } else {
        toast.error("Unexpected response from server");
        console.error("Unexpected cart response:", data);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={variant === "large" ? "lg" : "default"}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className="w-full gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {isLoading ? "Adding..." : children || "Add to Cart"}
    </Button>
  );
}

