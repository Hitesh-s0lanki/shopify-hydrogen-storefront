import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/cart';
import type {RootLoader} from '~/root';
import {CartMain} from '~/components/CartMain';
import {CartForm} from '@shopify/hydrogen';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Cart | Hydrogen'}];
};

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  
  // CartForm sends the action as a form field
  const cartAction = formData.get('cartAction') as string;

  if (!cartAction) {
    return new Response('Missing cart action', {status: 400});
  }

  let result;

  try {
    switch (cartAction) {
      case CartForm.ACTIONS.LinesAdd: {
        const linesInput = formData.get('lines');
        const lines = typeof linesInput === 'string' 
          ? JSON.parse(linesInput) 
          : linesInput;
        result = await cart.addLines(Array.isArray(lines) ? lines : [lines]);
        break;
      }
      case CartForm.ACTIONS.LinesUpdate: {
        const linesInput = formData.get('lines');
        const lines = typeof linesInput === 'string' 
          ? JSON.parse(linesInput) 
          : linesInput;
        result = await cart.updateLines(Array.isArray(lines) ? lines : [lines]);
        break;
      }
      case CartForm.ACTIONS.LinesRemove: {
        const lineIdsInput = formData.get('lineIds');
        const lineIds = typeof lineIdsInput === 'string' 
          ? JSON.parse(lineIdsInput) 
          : lineIdsInput;
        result = await cart.removeLines(Array.isArray(lineIds) ? lineIds : [lineIds]);
        break;
      }
      case CartForm.ACTIONS.NoteUpdate: {
        const note = formData.get('note') as string;
        result = await cart.updateNote(note);
        break;
      }
      case CartForm.ACTIONS.DiscountCodesUpdate: {
        const discountCodesInput = formData.get('discountCodes');
        const discountCodes = typeof discountCodesInput === 'string' 
          ? JSON.parse(discountCodesInput) 
          : discountCodesInput;
        result = await cart.updateDiscountCodes(
          Array.isArray(discountCodes) ? discountCodes : [discountCodes]
        );
        break;
      }
      case CartForm.ACTIONS.BuyerIdentityUpdate: {
        const buyerIdentityInput = formData.get('buyerIdentity');
        const buyerIdentity = typeof buyerIdentityInput === 'string' 
          ? JSON.parse(buyerIdentityInput) 
          : buyerIdentityInput;
        result = await cart.updateBuyerIdentity(buyerIdentity);
        break;
      }
      case CartForm.ACTIONS.CartAttributesUpdate: {
        const attributesInput = formData.get('attributes');
        const attributes = typeof attributesInput === 'string' 
          ? JSON.parse(attributesInput) 
          : attributesInput;
        result = await cart.updateCartAttributes(attributes);
        break;
      }
      case CartForm.ACTIONS.SelectedDeliveryOptionsUpdate: {
        const selectedDeliveryOptionsInput = formData.get('selectedDeliveryOptions');
        const selectedDeliveryOptions = typeof selectedDeliveryOptionsInput === 'string' 
          ? JSON.parse(selectedDeliveryOptionsInput) 
          : selectedDeliveryOptionsInput;
        result = await cart.updateSelectedDeliveryOptions(selectedDeliveryOptions);
        break;
      }
      case CartForm.ACTIONS.MetafieldsSet: {
        const metafieldsInput = formData.get('metafields');
        const metafields = typeof metafieldsInput === 'string' 
          ? JSON.parse(metafieldsInput) 
          : metafieldsInput;
        result = await cart.setMetafields(
          Array.isArray(metafields) ? metafields : [metafields]
        );
        break;
      }
      case CartForm.ACTIONS.GiftCardCodesUpdate: {
        const giftCardCodesInput = formData.get('giftCardCodes');
        const giftCardCodes = typeof giftCardCodesInput === 'string' 
          ? JSON.parse(giftCardCodesInput) 
          : giftCardCodesInput;
        result = await cart.updateGiftCardCodes(
          Array.isArray(giftCardCodes) ? giftCardCodes : [giftCardCodes]
        );
        break;
      }
      case CartForm.ACTIONS.GiftCardCodesRemove: {
        const giftCardCodesInput = formData.get('giftCardCodes');
        const giftCardCodes = typeof giftCardCodesInput === 'string' 
          ? JSON.parse(giftCardCodesInput) 
          : giftCardCodesInput;
        result = await cart.removeGiftCardCodes(
          Array.isArray(giftCardCodes) ? giftCardCodes : [giftCardCodes]
        );
        break;
      }
      default:
        return new Response('Invalid cart action', {status: 400});
    }

    if (result?.error) {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: {'Content-Type': 'application/json'},
      });
    }

    return result;
  } catch (error) {
    console.error('Cart action error:', error);
    return new Response(
      JSON.stringify({error: 'Failed to process cart action'}),
      {status: 500, headers: {'Content-Type': 'application/json'}}
    );
  }
}

export default function Cart() {
  const data = useRouteLoaderData<RootLoader>('root');
  const cart = data?.cart;

  return (
    <div className="cart min-h-full bg-background py-8 md:py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            Review your items and proceed to checkout when you're ready
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading your cart...</p>
            </div>
          }
        >
          <Await resolve={cart}>
            {(cartData) => <CartMain cart={cartData} layout="page" />}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

