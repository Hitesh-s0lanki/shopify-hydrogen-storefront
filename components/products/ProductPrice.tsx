"use client";

import { formatMoney } from "@/lib/utils";
import type { Money } from "@/modules/products/types";

interface ProductPriceProps {
  price?: Money | null;
  compareAtPrice?: Money | null;
}

export function ProductPrice({ price, compareAtPrice }: ProductPriceProps) {
  if (!price) {
    return <span>&nbsp;</span>;
  }

  if (compareAtPrice) {
    const discountPercent = Math.round(
      ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
        parseFloat(compareAtPrice.amount)) *
        100
    );

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatMoney(price)}
          </span>
          <s className="text-lg text-muted-foreground">
            {formatMoney(compareAtPrice)}
          </s>
        </div>
        {discountPercent > 0 && (
          <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
            Save {discountPercent}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="text-2xl font-bold text-foreground">{formatMoney(price)}</div>
  );
}

