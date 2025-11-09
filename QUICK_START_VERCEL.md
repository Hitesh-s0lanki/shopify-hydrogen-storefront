# Quick Start: Deploy to Vercel

This is a quick reference guide for deploying your Hydrogen storefront to Vercel.

## 🚀 Quick Deployment (5 minutes)

### Step 1: Prepare Environment Variables

Create a list of your environment variables (you'll need these in Vercel):

```bash
PUBLIC_STOREFRONT_API_TOKEN=your_token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
SESSION_SECRET=your_random_secret
NODE_ENV=production
```

Get your Shopify credentials from: **Shopify Admin → Settings → Apps and sales channels**

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect settings (they're in `vercel.json`)
4. Add your environment variables in the dashboard
5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 3: Add Environment Variables

In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable from Step 1
3. Select environments: **Production**, **Preview**, and **Development**

### Step 4: Verify Deployment

Visit your Vercel URL and test:
- ✅ Homepage loads
- ✅ Product pages work
- ✅ Search functions
- ✅ Cart operations work

## 📁 What Was Changed?

All changes are ready to deploy - no additional configuration needed!

### New Files
- ✅ `vercel.json` - Vercel configuration
- ✅ `server/index.ts` - Node.js server entry point
- ✅ `.vercelignore` - Files to exclude from deployment

### Modified Files
- ✅ `package.json` - Added `@react-router/node` and `build:vercel` script
- ✅ `react-router.config.ts` - Added Vercel-specific configuration
- ✅ `README.md` - Added deployment documentation

## 🔑 Required Environment Variables

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `PUBLIC_STOREFRONT_API_TOKEN` | `abc123...` | Shopify Admin → Settings → Apps |
| `PUBLIC_STORE_DOMAIN` | `mystore.myshopify.com` | Your Shopify store URL |
| `SESSION_SECRET` | Random string | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Set to "production" |

## 🎯 Build Commands

The project now supports two build targets:

```bash
# Build for Shopify Oxygen
npm run build

# Build for Vercel (Node.js)
npm run build:vercel
```

Vercel automatically uses `build:vercel` (configured in `vercel.json`)

## 🐛 Troubleshooting

### Build Fails
- **Check**: Are all environment variables set in Vercel?
- **Check**: Is `@react-router/node` in `package.json`?
- **Check**: Did the build complete successfully locally with `npm run build:vercel`?

### Site Shows 404
- **Check**: Is the rewrite rule in `vercel.json` correct?
- **Fix**: Redeploy to apply configuration changes

### API Errors
- **Check**: Is `PUBLIC_STORE_DOMAIN` in format `store.myshopify.com` (no https://)?
- **Check**: Is `PUBLIC_STOREFRONT_API_TOKEN` correct?

### Session Issues
- **Check**: Is `SESSION_SECRET` set?
- **Fix**: Add a random 32+ character string

## 📚 Additional Resources

- **Detailed Guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **All Changes**: See [DEPLOYMENT_CHANGES_SUMMARY.md](./DEPLOYMENT_CHANGES_SUMMARY.md)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## ⚡ Performance Tips

1. **Enable Vercel Analytics** in project settings
2. **Set up custom domain** for better SEO
3. **Configure caching** for static assets
4. **Monitor function logs** for errors

## 🔄 Continuous Deployment

Connect your Git repository to Vercel for automatic deployments:

1. **Main branch** → Automatic production deployment
2. **Other branches** → Automatic preview deployments
3. **Pull requests** → Preview URLs for testing

## 🆘 Need Help?

- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions
- Visit [Vercel Documentation](https://vercel.com/docs)
- Check [Shopify Hydrogen Docs](https://shopify.dev/docs/storefronts/headless/hydrogen)

---

**Ready to deploy?** → [vercel.com/new](https://vercel.com/new)

