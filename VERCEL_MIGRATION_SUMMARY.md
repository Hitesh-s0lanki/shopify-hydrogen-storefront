# Vercel Migration Summary

This document summarizes the changes made to make the Hydrogen storefront compatible with Vercel deployment.

## Files Modified

### 1. `vite.config.ts`

- **Removed**: `oxygen()` plugin (Cloudflare Workers specific)
- **Modified**: SSR configuration to target Node.js instead of Cloudflare Workers
- **Added**: `@shopify/hydrogen` to `noExternal` array
- **Added**: `target: 'node'` to SSR configuration

### 2. `react-router.config.ts`

- **Added**: `ssr: true` configuration
- **Added**: `serverBuildFile: 'index.js'` for consistent output
- **Added**: `serverModuleFormat: 'esm'` for ES modules support

### 3. `package.json`

- **Added**: `@react-router/node` dependency (v7.9.2)
- **Added**: `@vercel/node` dev dependency (v3.2.28)

### 4. `.gitignore`

- **Added**: `.env.local` to ignore local environment files
- **Added**: `.vercel` to ignore Vercel deployment cache

## Files Created

### 1. `vercel.json`

Vercel deployment configuration:

- Specifies Node.js 20.x runtime
- Configures serverless function at `api/index.js`
- Sets up URL rewrites to route all traffic through the serverless function
- Configures 30-second max duration for functions

### 2. `api/index.ts`

Main serverless function handler:

- Converts Vercel requests to Web API Request format
- Creates Hydrogen context with environment variables
- Handles React Router request processing
- Implements storefront redirects for 404s
- Converts Web API Response back to Vercel response format

### 3. `.vercelignore`

Specifies files to ignore during deployment:

- node_modules
- Environment files
- Git repository
- Cache directories
- Client dist files
- Log files

### 4. `VERCEL_DEPLOYMENT.md`

Comprehensive deployment guide including:

- Prerequisites
- Environment variable setup
- Deployment steps (Dashboard, CLI, Git)
- Troubleshooting tips
- Performance optimization suggestions

### 5. `README.md` (Updated)

- Added Vercel deployment section
- Linked to detailed deployment guide
- Maintained existing Oxygen deployment instructions

## Key Changes Explained

### Why Remove Oxygen Plugin?

The `oxygen()` plugin from `@shopify/mini-oxygen/vite` is specifically designed for Cloudflare Workers deployment. Vercel uses Node.js serverless functions, which require different module resolution and bundling strategies.

### Why Add @react-router/node?

This package provides the `createRequestHandler` function that's compatible with Node.js environments, replacing the Oxygen-specific handler from `@shopify/hydrogen/oxygen`.

### Why Create api/index.ts?

Vercel requires a serverless function to handle server-side rendering. The `api/index.ts` file:

1. Acts as the entry point for all requests
2. Bridges Node.js (Vercel) and Web API standards
3. Manages Hydrogen's context and session handling
4. Processes React Router requests

### Why Modify SSR Target?

The original configuration targeted Cloudflare Workers (edge runtime). Vercel's serverless functions run on Node.js, requiring different module bundling:

- `target: 'node'` ensures proper Node.js APIs
- `noExternal` includes packages that need bundling

## Environment Variables Required

All these must be set in Vercel Dashboard or via CLI:

```
SESSION_SECRET
PUBLIC_STOREFRONT_API_TOKEN
PRIVATE_STOREFRONT_API_TOKEN
PUBLIC_STORE_DOMAIN
PUBLIC_STOREFRONT_ID
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
PUBLIC_CUSTOMER_ACCOUNT_API_URL
PUBLIC_CHECKOUT_DOMAIN
```

Optional (for AI features):

```
OPENAI_API_KEY
```

## Deployment Process

1. **Install dependencies**: `npm install`
2. **Set environment variables** in Vercel Dashboard
3. **Deploy**: `vercel --prod` or via Git integration

## Compatibility Notes

### What Works

- ✅ Server-side rendering (SSR)
- ✅ Client-side hydration
- ✅ React Router routing
- ✅ Shopify Storefront API
- ✅ Shopify Customer Account API
- ✅ Session management
- ✅ Static asset serving
- ✅ Storefront redirects

### What Might Need Adjustment

- ⚠️ Any Cloudflare Workers-specific APIs
- ⚠️ Edge runtime features (moved to Node.js runtime)
- ⚠️ Long-running operations (30s max on Vercel Hobby, 60s on Pro)

## Reverting Changes

To revert back to Oxygen deployment:

1. Restore `oxygen()` plugin in `vite.config.ts`
2. Remove `target: 'node'` from SSR config
3. Remove `api/` directory
4. Remove `vercel.json` and `.vercelignore`
5. Use original `server.ts` without modifications
6. Deploy with `shopify hydrogen deploy`

## Testing

Before deploying to production:

1. Test locally with `npm run dev`
2. Test build with `npm run build`
3. Deploy to Vercel preview first
4. Verify all pages load correctly
5. Test checkout flow
6. Verify customer account features
7. Check AI features if enabled

## Performance Considerations

- Vercel serverless functions have a cold start time
- First request may be slower than subsequent requests
- Consider enabling Vercel Edge Network for better global performance
- Monitor function execution times in Vercel dashboard

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [React Router on Vercel](https://reactrouter.com/deploying/vercel)
- [Shopify Hydrogen](https://shopify.dev/docs/custom-storefronts/hydrogen)
