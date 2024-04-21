import express from 'express';
import config from './config';
import nunjucks from 'nunjucks';
import '../db/index';

// 引入 session
import session from 'express-session';

const mongoStore = require('connect-mongo')(session);

// 引入中间件
import errorLog from '../middle_wares/error_log';
import loginPass from '../middle_wares/login_pass';

// 引入路由
import indexRouter from '../routes/index';
import userRouter from '../routes/user';
import chatRouter from '../routes/chat';
import codeRouter from '../routes/code';
import router from '../routes/index';
import User from '../models/User';
import schedule from 'node-schedule';

const app = express();

// 配置定时任务
schedule.scheduleJob('0 0 * * *', () => {
  User.updateMany({}, { $set: { chat_limit: 10 } }, err => {
    console.log('user update');
  });
});

// 配置 session
app.use(session({
  secret: config.secret, // 加密字符串
  name: config.name, // 返回给客户端的key名称，默认connect_sid
  resave: false, // 强制保存session即使没有改变
  saveUninitialized: true, // 强制将未初始化的session存储，减轻服务器存储压力。默认true
  cookie: { maxAge: config.maxAge }, // 过期时长
  rolling: true, // 在每次请求时进行设置cookie，将重置cookie过期时间
  store: new mongoStore({
    // 将session数据存储到mongo数据库中
    url: config.dbUrl,
    touchAction: config.maxAge // 多长时间往数据中更新存储一次
  })
}));

// 配置公共资源访问路径
app.use(express.static(config.publicPath));

// 设置允许跨域的域名，*代表允许任意域名跨域
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type'); // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
  if (req.method.toLowerCase() === 'options') res.send(200); // 让options尝试请求快速结束
  else next();
});

// 配置中间件（nunjucks模板引擎能够作用到views文件夹中的模板）
nunjucks.configure(config.viewsPath, {
  autoescape: true,
  express: app,
  noCache: true // 不使用缓存，模板每次都会重新编译
});

// 挂载数据处理中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 挂载页面拦截中间件
app.use(loginPass);

// 挂载路由
app.use(indexRouter);
app.use(userRouter);
app.use(codeRouter);
app.use(chatRouter);

// 挂载错误日志中间件
app.use(errorLog);

app.use((req, res) => {
  res.render('404.html');
});

app.listen(config.port, () => {
  console.log(`server is running, port = ${config.port}`);
});
