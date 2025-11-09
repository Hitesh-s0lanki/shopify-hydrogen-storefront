import {useAsyncValue} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Badge} from '~/components/ui/badge';

export function CartBadgeContent() {
  const cartData = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(cartData);
  const count = cart?.totalQuantity ?? 0;

  if (count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
    >
      {count}
    </Badge>
  );
}

