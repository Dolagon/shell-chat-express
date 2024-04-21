// 页面拦截
export default (req, res, next) => {
  const exist = ['/user/login', '/user/forget', '/user/add', '/code/send', '/code/verify', '/captcha/create', '/captcha/verify', '/test'].some(str => req.path.includes(str));
  // 判断客户端请求是否处于有效登陆时期 或 登陆请求 或 非接口请求
  if (req.session.token || exist || !req.path.includes('api')) return next();
  // 没有登陆 或 登陆失效
  res.json({
    code: 401,
    msg: '认证失败'
  });
}
