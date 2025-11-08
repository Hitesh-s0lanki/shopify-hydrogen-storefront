import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Cart | Hydrogen'}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];
      // Combine discount codes already applied on cart
      const existingCodes = Array.isArray(inputs.discountCodes) 
        ? inputs.discountCodes 
        : inputs.discountCodes 
          ? [inputs.discountCodes] 
          : [];
      discountCodes.push(...existingCodes);
      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;
      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];
      // Combine gift card codes already applied on cart
      const existingCodes = Array.isArray(inputs.giftCardCodes) 
        ? inputs.giftCardCodes 
        : inputs.giftCardCodes 
          ? [inputs.giftCardCodes] 
          : [];
      giftCardCodes.push(...existingCodes);
      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    case CartForm.ACTIONS.NoteUpdate: {
      result = await cart.updateNote(inputs.note);
      break;
    }
    case CartForm.ACTIONS.CartAttributesUpdate: {
      result = await cart.updateCartAttributes(inputs.attributes);
      break;
    }
    case CartForm.ACTIONS.SelectedDeliveryOptionsUpdate: {
      result = await cart.updateSelectedDeliveryOptions(inputs.selectedDeliveryOptions);
      break;
    }
    case CartForm.ACTIONS.MetafieldsSet: {
      result = await cart.setMetafields(inputs.metafields);
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart min-h-full bg-background py-8 md:py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            Review your items and proceed to checkout when you're ready
          </p>
        </div>
        <CartMain layout="page" cart={cart} />
      </div>
    </div>
  );
}

