# Vercel Deployment Changes Summary

This document summarizes all changes made to enable Vercel deployment for your Hydrogen storefront.

## Files Created

### 1. `vercel.json`
**Purpose**: Vercel deployment configuration

**Key settings**:
- Build command: `npm run build:vercel`
- Output directory: `dist`
- Node.js runtime: 22.x
- Routes all traffic to the server function

### 2. `server/index.ts`
**Purpose**: Node.js server entry point for Vercel

**Key features**:
- Converts Oxygen Worker format to Node.js format
- Reads environment variables from `process.env`
- Handles Shopify Storefront API integration
- Implements session management
- Provides 404 redirect handling

### 3. `.vercelignore`
**Purpose**: Excludes unnecessary files from deployment

**Ignores**:
- Development files (node_modules, logs, cache)
- IDE configurations
- Local environment files
- Shopify CLI artifacts

### 4. `VERCEL_DEPLOYMENT.md`
**Purpose**: Comprehensive deployment guide

**Includes**:
- Step-by-step deployment instructions
- Required and optional environment variables
- Troubleshooting guide
- Performance optimization tips
- Custom domain setup

## Files Modified

### 1. `package.json`
**Changes**:
- Added `@react-router/node@7.9.2` dependency
- Added `build:vercel` script: `npm run codegen && react-router build`

**Why**: 
- Node.js adapter enables server-side rendering on Vercel
- Separate build script for Node.js-based deployments

### 2. `react-router.config.ts`
**Changes**:
- Added conditional SSR configuration for Vercel
- Set build directory explicitly
- Updated documentation

**Why**: Ensures proper build configuration for Node.js environments

### 3. `README.md`
**Changes**:
- Added build instructions for different platforms
- Added reference to Vercel deployment guide

**Why**: Helps developers understand deployment options

## Environment Variables Required

### Production Deployment (Vercel)

**Required**:
```bash
PUBLIC_STOREFRONT_API_TOKEN=<your-token>
PUBLIC_STORE_DOMAIN=<your-store>.myshopify.com
SESSION_SECRET=<random-secret>
NODE_ENV=production
```

**Optional** (depending on features used):
```bash
PRIVATE_STOREFRONT_API_TOKEN=<your-private-token>
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=<client-id>
PUBLIC_CUSTOMER_ACCOUNT_API_URL=<api-url>
PUBLIC_CHECKOUT_DOMAIN=<checkout-domain>
PUBLIC_STOREFRONT_ID=<storefront-id>
OPENAI_API_KEY=<openai-key>
PUBLIC_SITE_URL=https://your-domain.com
```

## Build Process Changes

### Previous (Oxygen only)
```bash
npm run build
```
- Uses Shopify Hydrogen CLI
- Builds for Cloudflare Workers (Oxygen)
- Output optimized for edge runtime

### New (Multi-platform)
```bash
# For Oxygen
npm run build

# For Vercel/Node.js
npm run build:vercel
```
- Vercel build uses React Router CLI directly
- Generates Node.js-compatible output
- Supports standard Node.js runtime features

## Architecture Changes

### Before: Oxygen Worker
```
Request → Oxygen Worker → server.ts (Worker format) → App
```

### After: Multi-platform Support
```
# Oxygen (unchanged)
Request → Oxygen Worker → server.ts → App

# Vercel (new)
Request → Vercel Function → server/index.ts → App
```

## Key Differences: Oxygen vs Vercel

| Aspect | Oxygen | Vercel |
|--------|--------|--------|
| Runtime | Cloudflare Workers | Node.js |
| Entry Point | `server.ts` (Worker format) | `server/index.ts` (Node.js) |
| Build Command | `shopify hydrogen build` | `react-router build` |
| Environment | Edge runtime | Serverless functions |
| Cold Start | ~50ms | ~200-500ms |
| Execution Time | 50s max | 10-60s (configurable) |
| Memory | Limited | Configurable |

## Testing Changes

### Local Development (unchanged)
```bash
npm run dev
```
Uses Shopify's development server (Mini Oxygen)

### Preview Vercel Build Locally
```bash
# Build for Vercel
npm run build:vercel

# Preview the build (requires additional setup)
npx vercel dev
```

## Deployment Workflow

### Option 1: Vercel Dashboard
1. Push code to Git repository
2. Import project to Vercel
3. Configure environment variables
4. Deploy automatically

### Option 2: Vercel CLI
```bash
# Install CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Integration
1. Connect repository to Vercel
2. Automatic deployments on push
3. Preview deployments for pull requests

## Migration Checklist

- [x] Install `@react-router/node` dependency
- [x] Create `vercel.json` configuration
- [x] Create `server/index.ts` entry point
- [x] Update `react-router.config.ts`
- [x] Add `build:vercel` script
- [x] Create `.vercelignore`
- [x] Document deployment process
- [ ] Set environment variables in Vercel dashboard
- [ ] Test deployment
- [ ] Verify all features work
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (optional)

## Common Issues & Solutions

### Issue: Build fails with "Cannot find module"
**Solution**: Ensure all dependencies are in `dependencies`, not `devDependencies`

### Issue: Runtime error "Cannot read property of undefined"
**Solution**: Check all environment variables are set in Vercel dashboard

### Issue: 404 for all routes
**Solution**: Verify `vercel.json` rewrites configuration is correct

### Issue: Session not persisting
**Solution**: Ensure `SESSION_SECRET` environment variable is set

## Performance Considerations

### Vercel-specific Optimizations
1. **Edge Functions**: Consider migrating to Vercel Edge Runtime for better cold starts
2. **Caching**: Implement proper Cache-Control headers
3. **Image Optimization**: Use Vercel Image Optimization
4. **Analytics**: Enable Vercel Analytics and Speed Insights

### Monitoring Recommendations
1. Set up error tracking (e.g., Sentry)
2. Monitor function execution times
3. Track cold start frequency
4. Monitor API response times

## Rollback Plan

If issues occur after deployment:

1. **Immediate**: Use Vercel's instant rollback feature
2. **Code revert**: Revert Git commits and redeploy
3. **Oxygen fallback**: Continue using Oxygen deployment with original build command

## Next Steps

1. **Deploy to Vercel** following [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. **Test thoroughly** in production environment
3. **Monitor performance** using Vercel dashboard
4. **Optimize** based on real-world usage patterns
5. **Set up CI/CD** for automated deployments

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Shopify Hydrogen Docs](https://shopify.dev/docs/storefronts/headless/hydrogen)
- [React Router Documentation](https://reactrouter.com/)
- [Node.js Adapter Docs](https://reactrouter.com/deploying/node)

## Changelog

**2025-11-09**: Initial Vercel deployment configuration
- Added Node.js adapter support
- Created deployment documentation
- Updated build scripts
- Configured Vercel settings

