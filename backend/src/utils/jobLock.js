const prisma = require('../config/prisma')

// Atomically claims job_locks(jobName) if it's unclaimed or its previous
// claim has expired. INSERT..ON CONFLICT..DO UPDATE..WHERE is a single
// round-trip compare-and-swap, so this is race-safe across instances
// without holding a session-scoped advisory lock open in the pool.
const tryAcquireJobLock = async (jobName, ttlMs) => {
  const rows = await prisma.$queryRaw`
    INSERT INTO job_locks (job_name, locked_until)
    VALUES (${jobName}, NOW() + (${ttlMs}::float * interval '1 millisecond'))
    ON CONFLICT (job_name) DO UPDATE
      SET locked_until = NOW() + (${ttlMs}::float * interval '1 millisecond')
      WHERE job_locks.locked_until < NOW()
    RETURNING job_name
  `
  return rows.length > 0
}

// Wraps a cron callback so only one backend instance runs it per schedule
// tick. ttlMs should comfortably exceed the job's expected duration — if an
// instance dies mid-run, the lock expires and the next scheduled tick can
// still pick it up.
const withJobLock = (jobName, ttlMs, fn) => async () => {
  const acquired = await tryAcquireJobLock(jobName, ttlMs)
  if (!acquired) {
    console.log(`[${jobName}] Skipped — lock held by another instance`)
    return
  }
  await fn()
}

module.exports = { withJobLock }
