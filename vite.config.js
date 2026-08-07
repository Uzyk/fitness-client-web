import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_REWRITES = [
  [/^\/app(\/.*)?$/, '/portal.html'],
  [/^\/admin(\/.*)?$/, '/portal.html'],
  [/^\/invite(\/.*)?$/, '/invite.html'],
  [/^\/encuesta(\/.*)?$/, '/encuesta.html'],
]

function devRewrites() {
  return {
    name: 'dev-rewrites',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, search = ''] = (req.url ?? '/').split('?')
        const query = search ? `?${search}` : ''
        for (const [pattern, target] of DEV_REWRITES) {
          if (pattern.test(pathname)) {
            req.url = `${target}${query}`
            break
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devRewrites()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        encuesta: 'encuesta.html',
        coach: 'coach.html',
        admin: 'admin.html',
        portal: 'portal.html',
        invite: 'invite.html',
      },
    },
  },
})
