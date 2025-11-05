import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  return (
    <li key={id} className="cart-line group">
      <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        {image && (
          <div className="flex-shrink-0">
            <Link prefetch="intent" to={lineItemUrl} className="block">
              <div className="relative overflow-hidden rounded-lg border bg-muted">
                <Image
                  alt={title}
                  aspectRatio="1/1"
                  data={image}
                  height={100}
                  loading="lazy"
                  width={100}
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <Link prefetch="intent" to={lineItemUrl} className="block">
            <h4 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h4>
          </Link>
          
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedOptions.map((option) => (
                <span
                  key={option.name}
                  className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  {option.name}: {option.value}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between gap-4 mt-3">
            <div className="font-semibold text-lg">
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>
            <CartLineQuantity line={line} />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity flex items-center gap-2">
      <div className="flex items-center gap-1 border rounded-lg bg-background">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="px-2 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
          >
            <span className="text-lg">&#8722;</span>
          </button>
        </CartLineUpdateButton>
        <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="px-2 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
          >
            <span className="text-lg">&#43;</span>
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button 
        disabled={disabled} 
        type="submit"
        className="px-3 py-1 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
