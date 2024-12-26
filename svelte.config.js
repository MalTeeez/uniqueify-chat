import adapter from './adapter/index.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'build', // the output directory for the pages of your extension
			assets: undefined, // the asset output directory is derived from pages if not specified explicitly
			fallback: undefined, // set to true to output an SPA-like extension
			manifestVersion: 3 // the version of the automatically generated manifest (Version 3 is required by Chrome).
		}),
		appDir: 'ext', // This is important - chrome extensions can't handle the default _app directory name.
	},
};

export default config;
