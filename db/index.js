import mongoose from 'mongoose';
import config from '../src/config';

mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
  console.log('数据库连接成功!');
});

db.on('error', err => {
  console.log('连接数据库时发生错误:' + err);
  mongoose.disconnect(); // 断开连接
});

db.on('close', () => {
  console.log('数据库断开，重新连接数据库');
  mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
});

export default db;
