import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
// Analytics from @shopify/hydrogen-react will be added when needed
// For now, we'll use a simplified approach
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import globalsStyles from '~/styles/globals.css?url';
import {NotFoundPage} from './components/404';
import {ErrorPage} from './components/ErrorPage';
import {createShopifyStorefrontClient, getShopifyEnv} from '~/lib/shopifyClient';
import {HEADER_QUERY, FOOTER_QUERY} from '~/lib/fragments';
import {PageLayout} from './components/pageLayout';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;
  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;
  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  try {
    const env = getShopifyEnv();
    const storefront = createShopifyStorefrontClient(env);
    const i18n = storefront.getI18n(args.request);

    // Fetch header and footer in parallel
    const [headerResult, footerResult] = await Promise.all([
      storefront.query(HEADER_QUERY, {
        variables: {
          headerMenuHandle: 'main-menu',
          language: i18n.language,
          country: i18n.country,
        },
      }).catch((error) => {
        console.error('Header query error:', error);
        return null;
      }),
      storefront.query(FOOTER_QUERY, {
        variables: {
          footerMenuHandle: 'footer',
          language: i18n.language,
          country: i18n.country,
        },
      }).catch((error) => {
        console.error('Footer query error:', error);
        return null;
      }),
    ]);

    return {
      header: headerResult,
      footer: Promise.resolve(footerResult),
      shop: {
        name: headerResult?.shop?.name || 'Store',
        id: headerResult?.shop?.id || '',
      },
      publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
      // Cart will be handled separately in Phase 2 if needed
      cart: Promise.resolve(null),
      isLoggedIn: Promise.resolve(false),
    };
  } catch (error) {
    console.error('Root loader error:', error);
    // Return minimal data if Shopify queries fail
    return {
      header: null,
      footer: Promise.resolve(null),
      shop: { name: 'Store', id: '' },
      publicStoreDomain: process.env.PUBLIC_STORE_DOMAIN || '',
      cart: Promise.resolve(null),
      isLoggedIn: Promise.resolve(false),
    };
  }
}

export function Layout({children}: {children?: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={globalsStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<typeof loader>('root');

  if (!data) {
    return <Outlet />;
  }

  // Analytics.Provider will be added in a future update
  // For now, render PageLayout directly
  return (
    <PageLayout {...data}>
      <Outlet />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage: string | undefined;
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? (typeof error.data === 'string' ? error.data : undefined);
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // For 404 errors, show the custom NotFoundPage
  if (errorStatus === 404) {
    return <NotFoundPage />;
  }

  // For other errors, show error page
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorPage status={errorStatus} message={errorMessage} error={error} />
    </div>
  );
}
