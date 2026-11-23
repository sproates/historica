import {defineConfig} from 'astro/config';

export default defineConfig({
  output: 'static',
  publicDir: './static',
  outDir: process.env.HISTORICA_STATIC_OUTPUT || './release/static-pilot',
  site: 'https://historica.online',
  trailingSlash: 'never',
  build: {format: 'directory'},
});
