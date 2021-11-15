/** @type {import('@sveltejs/kit').Config} */
import node from "@sveltejs/adapter-node";
import adapter from '@sveltejs/adapter-netlify';
const config = {
	kit: {
     	adapter: node({ env: { port: process|.env.PORT } }),
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;
