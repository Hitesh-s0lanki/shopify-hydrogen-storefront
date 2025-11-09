import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';

/**
 * React Router 7.9.x Configuration for Hydrogen
 *
 * This configuration uses the official Hydrogen preset to provide optimal
 * React Router settings. The serverBuildFile option is configured for
 * Vercel deployment using Node.js runtime.
 */
export default {
  presets: [hydrogenPreset()],
  // Configure for Node.js runtime (Vercel)
  ssr: true,
  serverBuildFile: 'index.js',
  serverModuleFormat: 'esm',
} satisfies Config;
