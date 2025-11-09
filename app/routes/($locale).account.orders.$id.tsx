import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {Package, MapPin, ExternalLink, ArrowLeft} from 'lucide-react';
import {Link} from 'react-router';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // Handle authentication status - redirects to login if not authenticated
  context.customerAccount.handleAuthStatus();
  
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();

  const getStatusBadgeVariant = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('fulfilled') || lowerStatus.includes('complete')) {
      return 'default';
    }
    if (lowerStatus.includes('pending')) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/account/orders">
                <ArrowLeft className="size-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mt-4">
            Order {order.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Placed on {new Date(order.processedAt!).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {order.statusPageUrl && (
          <Button asChild variant="outline">
            <a
              target="_blank"
              href={order.statusPageUrl}
              rel="noreferrer"
            >
              View Order Status
              <ExternalLink className="size-4 ml-2" />
            </a>
          </Button>
        )}
      </div>

      {order.confirmationNumber && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confirmation:</span>
              <span className="font-medium">{order.confirmationNumber}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((lineItem, lineItemIndex) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                    ))}
                  </TableBody>
                  <TableFooter>
                    {((discountValue && discountValue.amount) ||
                      discountPercentage) && (
                      <TableRow>
                        <TableHead colSpan={3}>Discounts</TableHead>
                        <TableCell className="text-right">
                          {discountPercentage ? (
                            <span className="text-destructive">
                              -{discountPercentage}% OFF
                            </span>
                          ) : (
                            discountValue && (
                              <span className="text-destructive">
                                -<Money data={discountValue!} />
                              </span>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableHead colSpan={3}>Subtotal</TableHead>
                      <TableCell className="text-right font-medium">
                        <Money data={order.subtotal!} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead colSpan={3}>Tax</TableHead>
                      <TableCell className="text-right font-medium">
                        <Money data={order.totalTax!} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableHead colSpan={3} className="text-lg">
                        Total
                      </TableHead>
                      <TableCell className="text-right text-lg font-bold">
                        <Money data={order.totalPrice!} />
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order?.shippingAddress ? (
                <address className="not-italic space-y-1">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  {order.shippingAddress.formatted && (
                    <p className="text-muted-foreground">
                      {order.shippingAddress.formatted}
                    </p>
                  )}
                  {order.shippingAddress.formattedArea && (
                    <p className="text-muted-foreground">
                      {order.shippingAddress.formattedArea}
                    </p>
                  )}
                </address>
              ) : (
                <p className="text-muted-foreground">
                  No shipping address defined
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Fulfillment Status
                </p>
                <Badge variant={getStatusBadgeVariant(fulfillmentStatus)}>
                  {fulfillmentStatus}
                </Badge>
              </div>
              <hr className="my-3 border-border" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Payment Status
                </p>
                <Badge variant={getStatusBadgeVariant(order.financialStatus || '')}>
                  {order.financialStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          {lineItem?.image && (
            <div className="shrink-0">
              <Image
                data={lineItem.image}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium">{lineItem.title}</p>
            {lineItem.variantTitle && (
              <p className="text-sm text-muted-foreground">
                {lineItem.variantTitle}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Money data={lineItem.price!} />
      </TableCell>
      <TableCell>{lineItem.quantity}</TableCell>
      <TableCell className="text-right font-medium">
        <Money data={lineItem.totalDiscount!} />
      </TableCell>
    </TableRow>
  );
}

