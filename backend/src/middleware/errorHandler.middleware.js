const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500

  // body-parser sends empty body with Content-Type: application/json
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }

  console.error(`[ERROR] ${req.method} ${req.path} → ${err.message}`)

  const isDev = process.env.NODE_ENV === 'development'
  // Below 500, err.message is a deliberate app-level message (validation, auth, etc.) — safe to expose.
  // At/above 500, it may leak DB/internal details — expose only in development.
  const message = status < 500 || isDev ? (err.message || 'Internal server error') : 'Internal server error'

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack })
  })
}

module.exports = errorHandler
