# Deploying Hydrogen Storefront to Vercel

This guide explains how to deploy your Shopify Hydrogen storefront to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. Vercel CLI installed (optional): `npm i -g vercel`
3. Your Shopify store credentials

## Configuration Changes

This project has been configured for Vercel deployment with the following changes:

1. **vite.config.ts** - Removed Oxygen-specific plugins, added Node.js SSR target
2. **react-router.config.ts** - Configured for Node.js/Vercel runtime
3. **vercel.json** - Vercel deployment configuration
4. **api/index.ts** - Vercel serverless function handler
5. **package.json** - Added @react-router/node and @vercel/node dependencies

## Environment Variables

You need to set the following environment variables in your Vercel project:

### Required Variables

```bash
# Session secret (generate a random string)
SESSION_SECRET=your-session-secret-here

# Shopify Storefront API
PUBLIC_STOREFRONT_API_TOKEN=your-public-storefront-api-token
PRIVATE_STOREFRONT_API_TOKEN=your-private-storefront-api-token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_ID=your-storefront-id

# Shopify Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-client-id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/12345678/account/customer/api/2024-01

# Checkout
PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com
```

### Optional Variables (for AI features)

```bash
# If you're using the AI chat features
OPENAI_API_KEY=your-openai-api-key
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the settings
5. Add all environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 3: Deploy via Git Integration

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Push to your main branch - Vercel will auto-deploy

## Setting Environment Variables

### Via Vercel Dashboard

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate values
4. Make sure to set them for all environments (Production, Preview, Development)

### Via Vercel CLI

```bash
vercel env add SESSION_SECRET
vercel env add PUBLIC_STOREFRONT_API_TOKEN
# ... add all other variables
```

## Build Configuration

The project uses the following build settings (configured in `vercel.json`):

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Runtime**: Node.js 20.x
- **Max Duration**: 30 seconds

## Troubleshooting

### Build Failures

If the build fails, check:

1. All environment variables are set correctly
2. Node.js version is 18.x or higher
3. Dependencies are correctly installed

### Runtime Errors

If the site deploys but doesn't work:

1. Check the Vercel logs for errors
2. Verify environment variables are set for the correct environment
3. Ensure your Shopify store is properly configured
4. Check that API tokens have the necessary permissions

### API Errors

If you get API errors:

1. Verify your Shopify API credentials
2. Check that your storefront is published
3. Ensure your API tokens haven't expired
4. Verify the API URLs are correct

## Performance Optimization

For better performance on Vercel:

1. Enable Vercel's Edge Network
2. Configure appropriate cache headers
3. Use Vercel's Image Optimization for product images
4. Monitor your Function execution times

## Reverting to Oxygen Deployment

If you want to deploy back to Shopify Oxygen:

1. Restore the original `vite.config.ts` (uncomment oxygen plugin)
2. Use the original `server.ts` for Cloudflare Workers
3. Remove the `api/` directory
4. Remove `vercel.json`
5. Deploy using `shopify hydrogen deploy`

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Shopify Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [React Router Documentation](https://reactrouter.com/docs)
