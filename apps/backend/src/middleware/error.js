module.exports = function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};