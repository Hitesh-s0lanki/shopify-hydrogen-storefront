# Vercel Deployment Guide

This guide explains how to deploy your Hydrogen storefront to Vercel.

## Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- Your Shopify store credentials
- Git repository connected to Vercel

## Environment Variables

You need to configure the following environment variables in your Vercel project settings:

### Required Variables

```bash
# Shopify Storefront API
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_string
```

### Optional Variables

```bash
# Private Storefront API (for draft orders, etc.)
PRIVATE_STOREFRONT_API_TOKEN=your_private_token

# Customer Account API (for customer login)
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_client_id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your_customer_account_api_url

# Custom Checkout Domain
PUBLIC_CHECKOUT_DOMAIN=checkout.your-domain.com

# Storefront ID (if using Hydrogen-specific features)
PUBLIC_STOREFRONT_ID=your_storefront_id

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Site URL
PUBLIC_SITE_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository

3. **Configure build settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add environment variables**:
   - Go to "Settings" → "Environment Variables"
   - Add all required environment variables listed above
   - Make sure to add them for Production, Preview, and Development environments

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

4. **Set environment variables**:
```bash
vercel env add PUBLIC_STOREFRONT_API_TOKEN
vercel env add PUBLIC_STORE_DOMAIN
vercel env add SESSION_SECRET
# ... add other variables
```

## Build Configuration

The project uses the following build configuration:

- **Build Command**: `npm run build:vercel` - Generates code and builds for Node.js
- **Output Directory**: `dist` - Contains the built application
- **Node.js Version**: 22.x (configured in vercel.json)
- **Function Runtime**: Node.js serverless functions

## Verification

After deployment:

1. Visit your Vercel deployment URL
2. Check the following:
   - Homepage loads correctly
   - Product pages load
   - Search functionality works
   - Cart operations function properly
   - Customer account features work (if configured)

## Troubleshooting

### Build Failures

1. **Check build logs** in Vercel dashboard
2. Ensure all environment variables are set correctly
3. Verify `@react-router/node` is installed: `npm list @react-router/node`

### Runtime Errors

1. Check **Function Logs** in Vercel dashboard
2. Verify environment variables are available at runtime
3. Check for missing dependencies

### API Connection Issues

1. Verify `PUBLIC_STOREFRONT_API_TOKEN` is correct
2. Ensure `PUBLIC_STORE_DOMAIN` format is `your-store.myshopify.com` (without `https://`)
3. Check Shopify Admin for API access settings

## Performance Optimization

### Edge Functions (Optional)

For better performance, consider using Vercel Edge Functions:

1. Update `vercel.json`:
```json
{
  "functions": {
    "server/index.js": {
      "runtime": "edge"
    }
  }
}
```

2. Note: Edge runtime has limitations (no Node.js built-ins)

### Caching

Configure caching headers in your routes for static assets:

```typescript
export const headers = () => ({
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
});
```

## Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update `PUBLIC_SITE_URL` environment variable

## Monitoring

Monitor your deployment:

1. **Analytics**: Enable in Vercel dashboard
2. **Error Tracking**: Consider integrating Sentry
3. **Performance**: Use Vercel Speed Insights

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Hydrogen Documentation](https://shopify.dev/docs/storefronts/headless/hydrogen)
- [React Router Documentation](https://reactrouter.com/)

## Additional Resources

- [Shopify Hydrogen Self-Hosting Guide](https://shopify.dev/docs/storefronts/headless/hydrogen/deployments/self-hosting)
- [Vercel Deployment Best Practices](https://vercel.com/docs/concepts/deployments/overview)

