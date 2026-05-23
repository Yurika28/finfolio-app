const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500

  // body-parser sends empty body with Content-Type: application/json
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }

  console.error(`[ERROR] ${req.method} ${req.path} → ${err.message}`)
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler
