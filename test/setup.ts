import { afterAll } from 'vitest'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)

/**
 * Global teardown — runs after every test file completes.
 *
 * Service unit tests (src/**\/__tests__\/**) inject a mock object into Node's
 * module cache in place of the real PrismaClient. The mock has no $disconnect
 * method, so the check below is a no-op for those files.
 *
 * Integration / smoke tests load the real PrismaClient (via app.js loading
 * its route tree). Calling $disconnect here releases the connection-pool
 * handles that would otherwise keep the Vitest worker alive after the suite.
 */
afterAll(async () => {
  const prismaPath = _require.resolve('../src/config/prisma')
  const cached = _require.cache[prismaPath]
  if (!cached) return

  const client = cached.exports
  if (typeof client?.$disconnect === 'function') {
    await client.$disconnect()
  }
})
