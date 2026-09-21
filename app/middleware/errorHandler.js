function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' }
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: '接口不存在' }
  });
}

module.exports = { errorHandler, notFoundHandler };