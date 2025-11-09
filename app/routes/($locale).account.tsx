import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {LogOut, User, Package, MapPin} from 'lucide-react';
import {cn} from '~/lib/utils';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // Handle authentication status - redirects to login if not authenticated
  context.customerAccount.handleAuthStatus();
  
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  const initials = customer?.firstName && customer?.lastName
    ? `${customer.firstName[0]}${customer.lastName[0]}`
    : customer?.firstName
      ? customer.firstName[0]
      : 'U';

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-medium">
                  {initials.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {customer?.firstName || 'Account'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer?.email || ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                <AccountNavLink to="/account/orders" icon={Package}>
                  Orders
                </AccountNavLink>
                <AccountNavLink to="/account/profile" icon={User}>
                  Profile
                </AccountNavLink>
                <AccountNavLink to="/account/addresses" icon={MapPin}>
                  Addresses
                </AccountNavLink>
                <hr className="my-2 border-border" />
                <LogoutButton />
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet context={{customer}} />
        </main>
      </div>
    </div>
  );
}

function AccountNavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{className?: string}>;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="size-4" />
      {children}
    </NavLink>
  );
}

function LogoutButton() {
  return (
    <Form method="POST" action="/account/logout" className="w-full">
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </Form>
  );
}

