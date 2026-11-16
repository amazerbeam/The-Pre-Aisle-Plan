// Boots Vite in SSR middleware mode so node scripts can import the client's JSX (and its CSS imports) as the app does.
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

const CLIENT_ROOT = fileURLToPath(new URL('../', import.meta.url))

export async function withSsr(fn) {
  const server = await createServer({ root: CLIENT_ROOT, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false } })
  try {
    return await fn((path) => server.ssrLoadModule(path))
  } finally {
    await server.close()
  }
}
