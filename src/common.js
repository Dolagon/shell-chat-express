import path from 'path';
import config from './config';
import nodeMailer from 'nodemailer';
import JSEncrypt from 'jsencrypt/bin/jsencrypt';
import md5 from 'blueimp-md5';
import { camelCase } from 'lodash/string';

const privateKey = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnSxb/5nJGjOL6\n' +
  'Bc6kzGbMap5GwPWSn4V5KmNxfW01mqOK600APFWzKgOKdVYaWMCaAoDDRwOM+YZf\n' +
  'crbnVQdY9uwxGoumzc+clkPJZf+E0QYb+m3KQ4oryqjnrfzm9ypKeig6rX1Giy1i\n' +
  '87lttKBAcd/JzMBhRot/a/0FmvU9wOpYJJaExWboC18w58uYKZh9rgv+eJKHdBzV\n' +
  '696slPUDBNg8fU0YDHag0a6WNUfeOnu9yvsnPD7RObyhU6ZXuFZ3h8bstskAEZmY\n' +
  '3CsqXr7yZNOX6M15b6jf0x+rjF1gqkjjB+BZ8Wq/8W6bFkuI5dfkwIyhE/un9oD2\n' +
  'yIu0M6uxAgMBAAECggEAUAP4Yjlk2x2zyoZQij5BxPAR+CF+07x86LE/kx68x3DJ\n' +
  'XD6jO8Of8evcebMZlcxxgrhDwiMLLbiDbs+9b/QZaZHg8rORrBywemLc1U11457e\n' +
  'Xy9up9maEswB8Z4kYoxBrBG1gCtOyhjzgmq0fCZyp6BPu4O1WFGXk0CharbtKbV/\n' +
  '1OEo9icDDYeYDG5aAnJYuDzsIrysAVcqH7Zwsc4jToqSv8mssWRNSxpZkjc2H8ud\n' +
  '1TQR3otRW0Dnte4kD3+kKstwKrWGweCNjOjIBWEWPmQ5pl3XMTt387UibCOQAw8P\n' +
  'z6RA5ZaVqBghmCCddNcFGNlZHIotOsI5jFgX1fFiqQKBgQDU7iSxN0SMT/p1neCV\n' +
  'oGeX63GCj5h5fONEasD8r9eh8fP4Lk258XFSH7jkgHUEXtaZAtTlC3FZqieP0JIH\n' +
  '1wmRTlLkegumjwgoOX7iI9dhpx3cTrzckBb1BZ4gw4HpFfdWCs+OD/XRbapaLlTY\n' +
  'YcAx2g3RcZj3SWfv9fOESycTUwKBgQDJIcvGmcyAlxjapR9uJk5qIcfxZpI6efxP\n' +
  'Wrb5gYbXk9GzqDoGR3pWs/aY4gPywFXoLdqrYNvNK37NrjH2mArhGsVM5O0UGvaZ\n' +
  'KoWSvR2SxnaLycFyuVYDnf3eNkesFUMnH5kpB/ML0OICNeN+LsVk1pbym2dm64Wx\n' +
  '1F/ZQCwIawKBgGZT19BOliO0H9I8P/zILGCm5lLvPUBNE08C2qHUw5TxGOTRI8tT\n' +
  'S7lCw3EUhqfGB+1angNAv4Vurzp+6l7YKaHp+Q4R1N2DaVEjaGW3Ab/NNx1zvXFl\n' +
  '0ZKI05g9PIZOZyGzalGEPAccY7yY/W9LcrjCaNeZdwCIB2obUZ7nGu0/AoGASork\n' +
  '/CEKIupdAsPJ50f5LeqBMN2j+lo1ga+MOuKfeAxH3v7NKoCZPcMK9NRnRDO2YwuD\n' +
  'jJqkO+EP6OjTiaIF/jGux/XcS+RGWrPgt2axrDEzxFEtCfjYgRSv/wg8/fEPZ1OV\n' +
  'rxhMIqfy64DPZHevHtVNMnMYGpPVg/fC4kCfUSsCgYEAkn2EcDvP8GXQOEPByjSv\n' +
  'C4r/19vTtfPCGxl4jRfvNvEQ53FRdICAlYlR9zzGjD9UTeJNx+1T4brTsng6I5n+\n' +
  'poNLcamkBGFTfzGaK3c71BGD9Vj3WiXvSNWPSVImfUulpiAfgjebaVIGKFgtzQWU\n' +
  'N8y8YiSzebg0BY0Zg2lC1wc=';

const salt = 'NhS7iMm9';

// 用户信息key
export const userInfoKeys = ['chat_limit', 'createdAt', 'email', 'phone', 'photo', 'status', 'updatedAt', 'username', '_id', 'open_context', 'stream', 'model'];

// 密码长度限制
export const pwdLimit = 20;

// 可用模型
export const usableGptModelMap = {
  'gpt-3.5-turbo': {
    consume: 1
  },
  'gpt-4-turbo-preview': {
    consume: 2
  }
};

// 发送邮箱验证码
export const nodeMail = nodeMailer.createTransport({
  service: '163',
  port: 465,
  auth: { user: config.sendEmail, pass: config.pop3 }
});

/**
 * 密码加密
 * @param pwd
 * @returns {string}
 */
export const encryptPwd = (pwd = '') => md5(md5(pwd) + salt);

/**
 * 设置上传图片名称
 * @param files files
 * @returns {{oldPath: string, newPath: string}} 旧路径 新路径
 */
export const setFilePath = files => {
  const num = parseInt(String(Math.random() * 8999 + 10000)); // 生成随机数
  const extname = path.extname(files.photo.originalFilename); // 拿到扩展名
  const oldPath = path.normalize(files.photo.filepath);
  const newFileName = (new Date()).getTime() + num + extname; // 新的路径
  const newPath = config.uploadPath + newFileName;
  return { oldPath, newPath };
};

/**
 * 获取当前时间
 * @returns {`${number}-${string}-${string} ${string}:${string}:${string}`}
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 解密
 * @param word
 * @returns {*}
 */
export const decrypt = (word = '') => {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey);
  return encryptor.decrypt(word);
};

export const camelCaseKeys = (obj = {}) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    const upperCaseKey = camelCase(key);
    newObj[upperCaseKey] = obj[key];
  });
  return newObj;
};
