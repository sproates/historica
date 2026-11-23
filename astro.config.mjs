import {defineConfig} from 'astro/config';

// Opt-in pilot only. Existing production and Pages packaging remain unchanged.
export default defineConfig({
  output: 'static',
  publicDir: './static',
  outDir: process.env.HISTORICA_STATIC_OUTPUT || './release/static-pilot',
  site: 'https://historica.online',
  trailingSlash: 'never',
  build: {format: 'directory'},
});
