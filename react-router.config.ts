import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';

/**
 * React Router 7.9.x Configuration for Hydrogen
 *
 * This configuration supports both Shopify Oxygen and Node.js (Vercel)
 * deployment targets based on the HYDROGEN_TARGET environment variable.
 */

// Check if building for Node.js (Vercel) or Oxygen
const isNodeBuild = process.env.HYDROGEN_TARGET === 'node';

const config: Config = {
  buildDirectory: './dist',
};

// Only use Hydrogen preset for Oxygen builds
if (!isNodeBuild) {
  config.presets = [hydrogenPreset()];
}

export default config;
