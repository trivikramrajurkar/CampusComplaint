// Centralized error handler — must be registered after all routes
export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid request body.' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
}
