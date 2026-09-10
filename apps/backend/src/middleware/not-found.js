module.exports = function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: 'Not found' });
};