# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Vite config updated (oxygen plugin removed, Node.js target added)
- [x] React Router config updated for Vercel
- [x] New dependencies installed (@react-router/node, @vercel/node)
- [x] API handler created at `api/index.ts`
- [x] Vercel configuration files created (vercel.json, .vercelignore)
- [x] .gitignore updated

### ⚠️ Environment Variables

Make sure you have these values ready from your Shopify admin:

- [ ] `SESSION_SECRET` - A secure random string (generate with: `openssl rand -base64 32`)
- [ ] `PUBLIC_STOREFRONT_API_TOKEN` - From Shopify Admin → Settings → Apps and sales channels
- [ ] `PRIVATE_STOREFRONT_API_TOKEN` - From Shopify Admin → Settings → Apps and sales channels
- [ ] `PUBLIC_STORE_DOMAIN` - Your store domain (e.g., `yourstore.myshopify.com`)
- [ ] `PUBLIC_STOREFRONT_ID` - Your storefront ID
- [ ] `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` - Customer Account API client ID
- [ ] `PUBLIC_CUSTOMER_ACCOUNT_API_URL` - Customer Account API URL
- [ ] `PUBLIC_CHECKOUT_DOMAIN` - Your checkout domain

Optional (for AI features):
- [ ] `OPENAI_API_KEY` - OpenAI API key (if using AI chat features)

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended for First Deployment)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Select your Git repository

3. **Configure Project**
   - Framework Preset: Other (Vercel will auto-detect settings)
   - Build Command: `npm run build` (already configured)
   - Output Directory: `dist` (already configured)
   - Install Command: `npm install` (already configured)

4. **Add Environment Variables**
   - Go to "Environment Variables" section
   - Add each variable from the list above
   - Select all environments (Production, Preview, Development)
   - Click "Add" for each variable

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Test your deployment URL

### Option 2: Vercel CLI (Faster for Updates)

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when prompted
   - Or add them later in the dashboard

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 3: Git Integration (Automatic Deployments)

1. **Connect Repository to Vercel**
   - Import project in Vercel dashboard
   - Select your Git provider (GitHub, GitLab, Bitbucket)
   - Authorize Vercel

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Settings → Environment Variables

3. **Enable Auto-Deploy**
   - Every push to main branch will auto-deploy
   - Pull requests will create preview deployments

## Post-Deployment Verification

After deployment, verify the following:

### ✅ Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Product pages display properly
- [ ] Collections load
- [ ] Search functionality works
- [ ] Images load correctly

### ✅ E-commerce Features
- [ ] Add to cart works
- [ ] Cart updates correctly
- [ ] Checkout redirects properly
- [ ] Product variants work

### ✅ Customer Account
- [ ] Login page loads
- [ ] Registration works
- [ ] Account dashboard accessible
- [ ] Order history displays

### ✅ Performance
- [ ] Page load times are acceptable
- [ ] No console errors in browser
- [ ] Mobile responsiveness works
- [ ] Images are optimized

## Troubleshooting

### Build Fails

**Check Vercel logs:**
```bash
vercel logs <deployment-url>
```

Common issues:
1. Missing environment variables
2. TypeScript errors
3. Dependency installation failures

**Solutions:**
- Verify all environment variables are set
- Run `npm run typecheck` locally
- Run `npm run build` locally to test

### Runtime Errors

**Check function logs in Vercel Dashboard:**
- Go to your project
- Click on "Logs" tab
- Filter by function errors

Common issues:
1. Environment variables not set for the right environment
2. Shopify API credentials incorrect
3. Session secret not set

**Solutions:**
- Verify environment variables in correct environment (Production/Preview)
- Test API credentials in Shopify admin
- Generate new session secret if needed

### Slow Response Times

**Monitor performance:**
- Check Vercel Analytics
- Review Function Duration in dashboard

**Solutions:**
- Enable Vercel Edge Network
- Optimize images
- Review database queries
- Consider upgrading Vercel plan for better performance

## Updating After Initial Deployment

For subsequent updates:

1. **Via Git (Recommended)**
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
   Vercel will auto-deploy on push to main branch

2. **Via CLI**
   ```bash
   vercel --prod
   ```

3. **Rollback if needed**
   - Go to Vercel Dashboard
   - Navigate to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

## Environment-Specific Testing

### Test Preview Deployment
Every pull request gets a preview URL. Test thoroughly before merging:
- [ ] All functionality works on preview
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile view works

### Test Production
After deploying to production:
- [ ] Visit production URL
- [ ] Test complete user journey
- [ ] Verify analytics tracking
- [ ] Check error monitoring

## Monitoring

Set up monitoring for your deployment:

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor function execution times
- [ ] Set up uptime monitoring
- [ ] Configure alerting for errors

## Optimization Tips

### Performance
1. Enable Vercel's Image Optimization
2. Use proper caching headers
3. Minimize bundle size
4. Lazy load components
5. Use edge middleware for auth checks

### Cost Optimization
1. Monitor function execution times
2. Optimize cold starts
3. Review bandwidth usage
4. Consider build minute usage
5. Optimize image delivery

## Support

If you encounter issues:

1. **Check Documentation**
   - [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide
   - [VERCEL_MIGRATION_SUMMARY.md](./VERCEL_MIGRATION_SUMMARY.md) - Technical changes

2. **Vercel Support**
   - [Vercel Documentation](https://vercel.com/docs)
   - [Vercel Community](https://github.com/vercel/vercel/discussions)
   - [Vercel Support](https://vercel.com/support)

3. **Shopify Support**
   - [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
   - [Shopify Community](https://community.shopify.com)

4. **React Router Support**
   - [React Router Documentation](https://reactrouter.com)
   - [React Router Deployment Guides](https://reactrouter.com/deploying)

