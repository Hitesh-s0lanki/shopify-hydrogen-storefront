# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Deploying to Vercel

The repository is preconfigured for Vercel's Edge Runtime using the instructions from Shopify's Hydrogen self-hosting guide. To
deploy:

1. Create a new Vercel project and connect it to this repository.
2. In **Project Settings → Environment Variables**, add the required Hydrogen secrets:
   - `SESSION_SECRET`
   - `PUBLIC_STORE_DOMAIN`
   - `PUBLIC_STOREFRONT_API_TOKEN`
   - `PRIVATE_STOREFRONT_API_TOKEN`
   - Optional keys such as `OPENAI_API_KEY` and `PUBLIC_SITE_URL`
3. Vercel automatically runs `npm install` and `npm run build`; the generated static assets in `dist/client` are uploaded and all
   requests are routed through the Edge function defined in `api/index.ts`.
4. Trigger a deployment with `vercel --prod` or by pushing to your default branch. Subsequent requests are served from the Edge
   runtime while still supporting server-side rendering and session cookies.

## Local development

```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
