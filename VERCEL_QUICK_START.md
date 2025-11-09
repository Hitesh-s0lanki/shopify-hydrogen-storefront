# Quick Start: Deploy Hydrogen to Vercel

## ✅ Configuration Complete

Your project is now configured for Vercel deployment with the following setup:

### Files Created/Modified
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.js` - Serverless function handler
- ✅ `.vercelignore` - Deployment exclusions
- ✅ `vite.config.ts` - Build configuration
- ✅ `react-router.config.ts` - Router configuration
- ✅ `package.json` - Dependencies updated

## 🚀 Deploy Now

### Step 1: Set Environment Variables

Before deploying, you MUST set these environment variables in Vercel Dashboard:

```bash
SESSION_SECRET=<generate-with-openssl-rand-base64-32>
PUBLIC_STOREFRONT_API_TOKEN=<your-token>
PRIVATE_STOREFRONT_API_TOKEN=<your-token>
PUBLIC_STORE_DOMAIN=<yourstore.myshopify.com>
PUBLIC_STOREFRONT_ID=<your-id>
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=<your-client-id>
PUBLIC_CUSTOMER_ACCOUNT_API_URL=<your-api-url>
PUBLIC_CHECKOUT_DOMAIN=<yourstore.myshopify.com>
```

**Optional (for AI features):**
```bash
OPENAI_API_KEY=<your-openai-key>
```

### Step 2: Deploy

#### Option A: Via Vercel CLI

```bash
# Deploy to preview
vercel

# Or deploy to production
vercel --prod
```

#### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variables
5. Click "Deploy"

### Step 3: Verify Deployment

After deployment completes:

1. ✅ Visit your deployment URL
2. ✅ Check that pages load
3. ✅ Test navigation
4. ✅ Verify cart functionality
5. ✅ Test checkout redirect

## 📋 How It Works

### Build Process
1. `npm run build` creates:
   - `dist/client/` - Static assets (HTML, CSS, JS)
   - `dist/server/` - Server-side rendering code

### Request Flow
1. Request comes to Vercel
2. Static assets served from `dist/client/`
3. Dynamic requests routed to `api/index.js`
4. Handler uses React Router with Hydrogen context
5. Response sent back to client

### Architecture
```
┌─────────────┐
│   Vercel    │
└──────┬──────┘
       │
       ├─ Static Assets (/assets/*)
       │  └─> dist/client/
       │
       └─ Dynamic Routes (/*.*)
          └─> api/index.js
              ├─> React Router
              ├─> Hydrogen Context
              └─> Shopify APIs
```

## 🔧 Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs <deployment-url>
```

**Common issues:**
- Missing environment variables
- TypeScript errors (run `npm run typecheck` locally)
- Build timeout (upgrade Vercel plan)

### Runtime Errors

**Check function logs in Vercel Dashboard**

**Common issues:**
- Environment variables not set for correct environment
- Shopify API credentials incorrect
- Session secret missing

### Static Assets Not Loading

**Check:**
- `dist/client/` directory exists after build
- Asset paths in HTML are correct
- Vercel is serving from correct output directory

## ⚙️ Configuration Files Explained

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

- **buildCommand**: Runs Hydrogen build
- **outputDirectory**: Points to static assets
- **rewrites**: Routes all requests through serverless function

### `api/index.js`
Main serverless function that:
- Converts Vercel requests to Web API format
- Creates Hydrogen context
- Handles React Router requests
- Manages sessions and cookies
- Handles 404 redirects

## 📊 Performance Tips

1. **Enable Vercel Analytics** in project settings
2. **Use Image Optimization** for product images
3. **Monitor Function Execution** times
4. **Set up Error Tracking** (Sentry, etc.)
5. **Enable Edge Caching** for static assets

## 🔄 Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically redeploy (if Git integration is enabled).

Or manually deploy:
```bash
vercel --prod
```

## 📝 Notes

- **Dev Server**: Still uses Oxygen plugin (works locally)
- **Production**: Uses Vercel serverless functions
- **Static Assets**: Served by Vercel Edge Network
- **API Calls**: Proxied through serverless function

## ⚠️ Important

1. **Environment Variables**: Must be set in Vercel Dashboard
2. **Build Output**: Don't commit `dist/` directory
3. **API Keys**: Never commit `.env` files
4. **Session Secret**: Generate a secure random string

## 🆘 Need Help?

- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed guide
- Check [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) for step-by-step checklist
- Review [VERCEL_MIGRATION_SUMMARY.md](./VERCEL_MIGRATION_SUMMARY.md) for technical details

---

**Ready to Deploy?** 🚀

```bash
vercel --prod
```

