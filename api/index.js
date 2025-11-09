/**
 * Vercel Serverless Function for Hydrogen Storefront
 */

import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@react-router/node';
import {createHydrogenRouterContext} from '../app/lib/context.ts';
import * as build from '../dist/server/index.js';

// Create environment from process.env
function getEnv() {
  return {
    SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret',
    PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN || '',
    PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN || '',
    PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN || '',
    PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID || '',
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '',
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL || '',
    PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN || '',
  };
}

// Create mock execution context
function getExecutionContext() {
  return {
    waitUntil: (promise) => promise,
    passThroughOnException: () => {},
  };
}

export default async function handler(req, res) {
  try {
    // Build Web Request from Vercel request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.append(key, value);
        }
      }
    }

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const env = getEnv();
    const executionContext = getExecutionContext();

    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      executionContext,
    );

    // Create React Router request handler
    const handleRequest = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || 'production',
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set('Set-Cookie', await hydrogenContext.session.commit());
    }

    let finalResponse = response;

    if (response.status === 404) {
      finalResponse = await storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    // Send response
    res.status(finalResponse.status);
    
    finalResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const responseBody = await finalResponse.text();
    res.send(responseBody);
  } catch (error) {
    console.error('Vercel handler error:', error);
    res.status(500).send('An unexpected error occurred');
  }
}

