import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rust-for-node-devs.vercel.app',
  output: 'static',
  // Matches vercel.json `trailingSlash: false` so sitemap URLs equal canonical URLs.
  trailingSlash: 'never',
  integrations: [sitemap()]
});