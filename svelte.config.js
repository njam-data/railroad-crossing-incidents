import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import staticAdapter from '@sveltejs/adapter-static'

const env = process.env.NODE_ENV

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: staticAdapter(),
    paths: {
      base: env === 'development' ? '' : '/railroad-crossing-incidents'
    },

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

    vite: {
      resolve: {
        alias: {
          $components: resolve('src/components'),
          $data: resolve('data/')
        }
      }
    }
  }
}

export default config
