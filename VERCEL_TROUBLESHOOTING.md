# Vercel Deployment Troubleshooting

## Common Errors and Solutions

### Error: "500: INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED"

This error means the serverless function crashed. Here's how to fix it:

#### 1. Check Vercel Function Logs

1. Go to your project in Vercel Dashboard
2. Click on the failed deployment
3. Go to **Functions** tab
4. Click on the function that failed
5. View the error logs

#### 2. Common Causes

**A. Missing Build Output**
- **Problem**: The `dist` folder wasn't created or deployed
- **Solution**: 
  ```bash
  # Test build locally first
  npm run build:vercel
  
  # Verify dist folder exists
  ls -la dist/server/index.js
  ls -la dist/client/
  ```

**B. Missing Environment Variables**
- **Problem**: Required Shopify credentials not set
- **Solution**: Add these in Vercel Dashboard → Settings → Environment Variables:
  ```
  PUBLIC_STOREFRONT_API_TOKEN=your_token
  PUBLIC_STORE_DOMAIN=your-store.myshopify.com
  SESSION_SECRET=<32+ character random string>
  NODE_ENV=production
  ```

**C. Import Path Issues**
- **Problem**: The function can't find required files
- **Solution**: Already configured in `vercel.json` with `includeFiles`
- Make sure these files exist:
  - `dist/server/index.js`
  - `app/lib/context.js`

**D. Node.js Version Mismatch**
- **Problem**: Different Node version between local and Vercel
- **Solution**: Check your local version matches Vercel:
  ```bash
  node --version  # Should be 18.x or 20.x
  ```

#### 3. Debugging Steps

**Step 1: Verify Local Build**
```bash
# Clean and rebuild
rm -rf dist
npm run build:vercel

# Check output
ls -la dist/server/
ls -la dist/client/
```

**Step 2: Check File Structure**
Your deployment should have:
```
/
├── api/
│   └── index.js          # Serverless function
├── dist/
│   ├── client/           # Static assets
│   └── server/           # Server bundle
│       └── index.js      # React Router build
└── app/
    └── lib/
        └── context.js    # Hydrogen context
```

**Step 3: Test Environment Variables**
Add a temporary log in `api/index.js`:
```javascript
console.log('Environment check:', {
  hasToken: !!process.env.PUBLIC_STOREFRONT_API_TOKEN,
  hasDomain: !!process.env.PUBLIC_STORE_DOMAIN,
  hasSecret: !!process.env.SESSION_SECRET,
});
```

**Step 4: Check Build Command**
Verify in Vercel Dashboard → Settings → General:
- Build Command: `npm run build:vercel`
- Output Directory: `dist/client`
- Install Command: `npm install`

### Error: "Cannot find module '../dist/server/index.js'"

**Cause**: The server build wasn't included in the deployment

**Solution**:
1. Check `.vercelignore` doesn't exclude `dist/`
2. Verify `vercel.json` has:
   ```json
   {
     "functions": {
       "api/**/*.js": {
         "includeFiles": "{dist/**,app/**}"
       }
     }
   }
   ```
3. Redeploy

### Error: "Cannot find module '../app/lib/context.js'"

**Cause**: Source files weren't included

**Solution**:
1. Verify `vercel.json` includes `app/**` in `includeFiles`
2. Check `.vercelignore` doesn't exclude `app/`
3. Redeploy

### Error: "Session is not defined"

**Cause**: `SESSION_SECRET` environment variable missing

**Solution**:
```bash
# Generate a secret
openssl rand -base64 32

# Add to Vercel Dashboard
# Settings → Environment Variables → Add
# Name: SESSION_SECRET
# Value: <paste generated secret>
```

### Error: "Storefront API error"

**Cause**: Shopify credentials incorrect or missing

**Solution**:
1. Verify in Shopify Admin:
   - Go to Settings → Apps and sales channels
   - Check Storefront API access token
   - Confirm store domain (format: `store.myshopify.com`)

2. Update in Vercel:
   ```
   PUBLIC_STOREFRONT_API_TOKEN=<correct token>
   PUBLIC_STORE_DOMAIN=<your-store>.myshopify.com
   ```

### Error: "Build exceeded maximum duration"

**Cause**: Build taking too long

**Solution**:
1. Check your internet connection (downloads dependencies)
2. Increase Vercel build timeout (Pro plan)
3. Use build cache:
   ```json
   {
     "buildCommand": "npm run build:vercel",
     "installCommand": "npm ci"
   }
   ```

## Verification Checklist

Before deploying, verify:

- [ ] `npm run build:vercel` completes successfully locally
- [ ] `dist/server/index.js` exists
- [ ] `dist/client/` contains assets
- [ ] All required environment variables are set in Vercel
- [ ] `.vercelignore` includes `!dist` and `!app`
- [ ] `vercel.json` has `includeFiles` configuration
- [ ] Node.js version in local matches Vercel (18+ or 20+)

## Getting More Information

### Enable Detailed Logging

Add this to `api/index.js` at the top of the handler:
```javascript
console.log('Function started:', {
  url: req.url,
  method: req.method,
  env: Object.keys(process.env).filter(k => k.includes('PUBLIC')),
});
```

### Check Vercel Logs

```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs <deployment-url>

# Real-time logs
vercel logs <deployment-url> --follow
```

### Test Locally with Vercel Dev

```bash
# Install dependencies
npm install

# Build
npm run build:vercel

# Test with Vercel dev server
vercel dev
```

## Still Having Issues?

1. **Check Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Review Function Logs**: Vercel Dashboard → Your Project → Functions
3. **Try a Fresh Deployment**: 
   ```bash
   vercel --force
   ```
4. **Verify Build Output**: Download build artifacts from Vercel dashboard

## Contact Support

If none of the above work:

1. Export your deployment logs from Vercel
2. Check the specific error message in function logs
3. Refer to:
   - [Vercel Functions Documentation](https://vercel.com/docs/functions)
   - [Shopify Hydrogen Documentation](https://shopify.dev/docs/storefronts/headless/hydrogen)
   - [React Router Docs](https://reactrouter.com/)

## Quick Fix Commands

```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build:vercel

# Force redeploy
vercel --force --prod

# Check logs
vercel logs --follow
```

---

**Most Common Fix**: Missing environment variables. Double-check all required variables are set in Vercel Dashboard!

