/**
 * Vercel Serverless Function for Hydrogen Storefront
 * This is a JavaScript file (not TypeScript) to avoid build complexity
 */

// Import the compiled server build
const path = require('path');

export default async function handler(req, res) {
  try {
    // Serve static assets
    if (req.url.startsWith('/assets/')) {
      return res.status(404).send('Static assets should be served by Vercel');
    }

    // For now, return a simple response
    // The full implementation requires the server build to be available
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hydrogen Storefront</title>
        </head>
        <body>
          <h1>Hydrogen Storefront on Vercel</h1>
          <p>Server is running. Build configuration in progress.</p>
          <p>Request URL: ${req.url}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).send('Internal Server Error');
  }
}

