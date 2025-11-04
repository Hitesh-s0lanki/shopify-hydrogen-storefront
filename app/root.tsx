import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import globalsStyles from '~/styles/globals.css?url';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {PageLayout} from './components/pageLayout';
import {NotFoundPage} from './components/404';

export type RootLoader = typeof loader;

export function links() {
  return [{rel: 'icon', type: 'image/svg+xml', href: favicon}];
}

export async function loader(args: Route.LoaderArgs) {
  const {storefront, cart, customerAccount, env} = args.context;

  // Load critical header data
  const header = await storefront.query(HEADER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      headerMenuHandle: 'main-menu',
    },
  });

  // Defer footer and cart data
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    header,
    cart: cart.get(),
    footer,
    isLoggedIn: customerAccount.isLoggedIn(),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* <link rel="stylesheet" href={appStyles}></link> */}
        <link rel="stylesheet" href={globalsStyles}></link>
        <title>Hydrogen</title>
        <meta
          name="description"
          content="Hydrogen is a framework for building Shopify apps."
        />
        <meta name="keywords" content="Hydrogen, Shopify, Framework" />
        <meta name="author" content="Shopify" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="yandexbot" content="index, follow" />
        <meta name="sitemap" content="/sitemap.xml" />
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
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <PageLayout
      cart={data.cart}
      footer={data.footer}
      header={data.header}
      isLoggedIn={data.isLoggedIn}
      publicStoreDomain={data.publicStoreDomain}
    >
      <Outlet />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<RootLoader>('root');
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // For 404 errors, show the custom NotFoundPage
  if (errorStatus === 404) {
    if (data) {
      return (
        <PageLayout
          cart={data.cart}
          footer={data.footer}
          header={data.header}
          isLoggedIn={data.isLoggedIn}
          publicStoreDomain={data.publicStoreDomain}
        >
          <NotFoundPage />
        </PageLayout>
      );
    }
    return <NotFoundPage />;
  }

  // For other errors, show error details
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">
          Oops! Something went wrong
        </h1>
        <h2 className="mb-4 text-lg text-muted-foreground">
          Error {errorStatus}
        </h2>
        {errorMessage && (
          <div className="rounded-md bg-muted p-4">
            <pre className="text-sm">{errorMessage}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
