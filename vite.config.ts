import {defineConfig, type Plugin} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// Plugin to suppress sourcemap resolution warnings for client components
function suppressSourcemapWarnings(): Plugin {
  return {
    name: 'suppress-sourcemap-warnings',
    enforce: 'pre',
    buildStart() {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0];
        if (
          typeof message === 'string' &&
          message.includes('Error when using sourcemap for reporting an error')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };
    },
  };
}

// Check if building for Node.js (Vercel) or Oxygen
const isNodeBuild = process.env.HYDROGEN_TARGET === 'node';

export default defineConfig({
  plugins: [
    suppressSourcemapWarnings(),
    tailwindcss(),
    hydrogen(),
    // Only include oxygen plugin for Oxygen builds
    ...(isNodeBuild ? [] : [oxygen()]),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
    // Disable sourcemaps in production to avoid resolution errors
    sourcemap: false,
    // Configure CSS sourcemaps separately
    cssCodeSplit: true,
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    // Configure esbuild to handle sourcemaps better for client components
    sourcemap: false,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'set-cookie-parser',
        'cookie',
        'react-router',
        'react-markdown',
        'style-to-js',
        'hast-util-to-jsx-runtime',
      ],
    },
    /**
     * Bundle these dependencies for SSR (Cloudflare Workers ESM environment)
     * instead of treating them as external modules
     */
    noExternal: ['react-markdown', 'style-to-js', 'hast-util-to-jsx-runtime'],
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
