import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Runs once per test file — handles Prisma disconnect after integration tests.
    setupFiles: ['./test/setup.ts'],

    include: [
      // Service unit tests: CJS mock injection via createRequire
      'src/**/__tests__/**/*.test.mjs',
      // Integration / smoke tests: TypeScript + supertest
      'test/**/*.test.ts',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      // Jobs are fire-and-forget cron wrappers; exclude from coverage metrics.
      exclude: ['src/jobs/**', 'src/**/__tests__/**'],
    },
  },
})
