import Error from '../models/Error';

// 处理异常日志
export default (err, req, res, next) => {
  const { name, message, stack } = err;
  const data = {
    error_name: name,
    error_msg: message,
    error_stack: stack
  };
  const msg = message || '服务器内部错误';
  Error.create(data, () => {
    if (err?.chatStream) {
      res.write(`data: ${JSON.stringify({ err: msg })}\n\n`);
      res.end();
      return;
    }
    res.json({
      code: 500,
      msg
    });
  });
}
