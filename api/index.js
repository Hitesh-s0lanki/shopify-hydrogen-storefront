/**
 * Vercel serverless function handler for Hydrogen storefront
 * 
 * This is a self-contained handler that creates the Hydrogen context
 * and handles requests using the React Router build.
 */

export default async function handler(req, res) {
  try {
    // Dynamic imports
    const {createRequestHandler, storefrontRedirect, createHydrogenContext, createCookieSessionStorage} = await import('@shopify/hydrogen');
    const serverBuildPath = new URL('../dist/server/index.js', import.meta.url);
    const build = await import(serverBuildPath.href);

    // Convert Node.js IncomingMessage to Fetch API Request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);
    
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    // Create Env object from environment variables
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:
        process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_URL:
        process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
      PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
    };

    // Create a mock ExecutionContext
    const executionContext = {
      waitUntil: (promise) => promise,
      passThroughOnException: () => {},
    };

    // Create Hydrogen context (inline to avoid TypeScript path alias issues)
    const hydrogenContext = await createHydrogenContext({
      request,
      env,
      waitUntil: executionContext.waitUntil.bind(executionContext),
      session: createCookieSessionStorage({
        cookie: {
          name: 'session',
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secrets: [env.SESSION_SECRET],
        },
      }),
      // Additional context (empty for now, but can be extended)
    });

    // Create request handler with the built application
    const handleRequest = createRequestHandler({
      build: build,
      mode: process.env.NODE_ENV || 'production',
      getLoadContext: () => hydrogenContext,
    });

    // Handle the request
    const response = await handleRequest(request);

    // Handle session cookies
    if (hydrogenContext.session?.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    // Handle 404 redirects from Shopify
    if (response.status === 404) {
      const redirectResponse = await storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
      
      // Convert Fetch Response to Node.js response
      res.status(redirectResponse.status);
      redirectResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const body = await redirectResponse.text();
      return res.send(body);
    }

    // Convert Fetch API Response to Node.js response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Server error:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    res.status(500).send(`An unexpected error occurred: ${error.message}\n\nCheck Vercel function logs for details.`);
  }
}

