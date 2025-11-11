"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ProductOption, ProductVariant } from "@/modules/products/types";

interface ProductFormProps {
  productOptions: ProductOption[];
  selectedVariant: ProductVariant | null | undefined;
  hideAddToCart?: boolean;
}

export function ProductForm({
  productOptions,
  selectedVariant,
  hideAddToCart = false,
}: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const options: Record<string, string> = {};
      productOptions.forEach((option) => {
        const param = searchParams.get(option.name.toLowerCase());
        if (param) {
          options[option.name] = param;
        } else if (option.optionValues.length > 0) {
          options[option.name] = option.optionValues[0].name;
        }
      });
      return options;
    }
  );

  const handleOptionChange = (optionName: string, valueName: string) => {
    const newOptions = { ...selectedOptions, [optionName]: valueName };
    setSelectedOptions(newOptions);

    // Update URL with selected options
    const params = new URLSearchParams();
    Object.entries(newOptions).forEach(([key, value]) => {
      params.set(key.toLowerCase(), value);
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name} className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              {option.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const isSelected = selectedOptions[option.name] === value.name;
                const isAvailable = value.firstSelectableVariant?.availableForSale ?? true;
                const swatch = value.swatch;
                const hasSwatch = swatch?.color || swatch?.image?.previewImage?.url;

                return (
                  <button
                    key={value.name}
                    type="button"
                    onClick={() => handleOptionChange(option.name, value.name)}
                    disabled={!isAvailable}
                    className={`
                      relative min-w-[60px] rounded-md border-2 px-4 py-2 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:border-primary/50"
                      }
                      ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    style={
                      hasSwatch && swatch?.color
                        ? {
                            backgroundColor: swatch.color,
                            color: isSelected ? "inherit" : "inherit",
                          }
                        : undefined
                    }
                  >
                    {swatch?.image?.previewImage?.url ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={swatch.image.previewImage.url}
                          alt={value.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                        <span>{value.name}</span>
                      </div>
                    ) : (
                      value.name
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

