/**
 * Smoke test — verifies the test runner is wired correctly.
 *
 * Imports the Express app directly (not server.js) so no HTTP server is
 * started, no cron jobs are scheduled, and no Socket.io is initialised.
 * Supertest creates a temporary server internally for the duration of each
 * request and tears it down automatically.
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)
const app = _require('../src/app')

describe('GET /health', () => {
  it('returns HTTP 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('body has { status: "ok" }', async () => {
    const res = await request(app).get('/health')
    expect(res.body).toMatchObject({ status: 'ok' })
  })

  it('body includes a valid ISO timestamp', async () => {
    const res = await request(app).get('/health')
    expect(new Date(res.body.ts).getTime()).not.toBeNaN()
  })
})
