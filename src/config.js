import { join } from 'path';

export default {
  secret: 'keypoint',
  name: 'sKey',
  port: +process.env.PORT || 3004,
  maxAge: 86400000 * 7, // session过期时长（单位毫秒）7天时长
  viewsPath: join(__dirname, '../views'),
  publicPath: join(__dirname, '../public'),
  uploadPath: join(__dirname, '../public/uploads/'),
  dbUrl: '',
  sendEmail: 'vegetab1e@163.com', // POP3/SMTP服务
  pop3: 'JTRWSSMXPDDFKZIY',
  httpsProxy: 'http://127.0.0.1:7890/' // 代理请求地址
};
