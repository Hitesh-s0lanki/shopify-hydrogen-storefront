import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {Badge} from '~/components/ui/badge';
import {Search, ShoppingBag, ArrowRight} from 'lucide-react';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // Handle authentication status - redirects to login if not authenticated
  context.customerAccount.handleAuthStatus();
  
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-2">
          View and track your order history
        </p>
      </div>

      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <PaginatedResourceSection connection={orders}>
                    {({node: order}) => (
                      <OrderRow key={order.id} order={order} />
                    )}
                  </PaginatedResourceSection>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters ? 'No orders found' : "You haven't placed any orders yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasFilters
              ? 'Try adjusting your search filters.'
              : 'Start shopping to see your orders here.'}
          </p>
          {hasFilters ? (
            <Button asChild variant="outline">
              <Link to="/account/orders">Clear filters</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/collections">Start Shopping</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-5" />
          Filter Orders
        </CardTitle>
        <CardDescription>
          Search for orders by order number or confirmation number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Search orders"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="order-number">Order #</Label>
              <Input
                id="order-number"
                type="search"
                name={ORDER_FILTER_FIELDS.NAME}
                placeholder="Order #"
                aria-label="Order number"
                defaultValue={currentFilters.name || ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmation-number">Confirmation #</Label>
              <Input
                id="confirmation-number"
                type="search"
                name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
                placeholder="Confirmation #"
                aria-label="Confirmation number"
                defaultValue={currentFilters.confirmationNumber || ''}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                disabled={isSearching}
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  formRef.current?.reset();
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function OrderRow({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  
  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'secondary';
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
    <TableRow>
      <TableCell className="font-medium">
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="hover:underline text-primary"
        >
          #{order.number}
        </Link>
      </TableCell>
      <TableCell>
        {new Date(order.processedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {order.confirmationNumber ? (
          <span className="text-muted-foreground">
            {order.confirmationNumber}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={getStatusBadgeVariant(order.financialStatus)}>
            {order.financialStatus}
          </Badge>
          {fulfillmentStatus && (
            <Badge variant={getStatusBadgeVariant(fulfillmentStatus)}>
              {fulfillmentStatus}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        <Money data={order.totalPrice} />
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/account/orders/${btoa(order.id)}`}>
            View
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

