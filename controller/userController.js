import formidable from 'formidable';
import config from '../src/config';
import User from '../models/User';
import path from 'path';
import fs from 'fs';
import { decrypt, encryptPwd, pwdLimit, setFilePath, userInfoKeys } from '../src/common';
import { snakeCase } from 'lodash';

class UserController {
  constructor() {
  }

  // 添加用户
  async addUser(req, res, next) {
    // form-data
    const form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = config.uploadPath;
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) return next(err);
      const requiredKeys = {
        username: '用户名',
        password: '密码',
        email: '邮箱'
      };
      const keys = Object.keys(requiredKeys);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!fields[key]) return res.json({
          code: 400,
          msg: `${requiredKeys[key]}不能为空`
        });
      }
      const { username, status, email } = fields;
      const password = decrypt(fields.password);
      const saveData = async newPath => {
        try {
          const existUser = await User.findOne({ username });
          if (existUser) return res.json({
            code: 400,
            msg: '该用户名已注册'
          });
          const existEmail = await User.findOne({ email });
          if (existEmail) return res.json({
            code: 400,
            msg: '该邮箱已注册'
          });
          if (password.length > pwdLimit) return res.json({
            code: 400,
            msg: `密码不能超出${pwdLimit}位`
          });
          const data = {
            username,
            password: encryptPwd(password),
            status,
            email
          };
          if (newPath) data.photo = path.basename(newPath);
          const result = await User.create(data);
          if (result) {
            res.json({
              code: 200,
              msg: `${status ? '管理员' : '用户'}注册成功`
            });
          }
        } catch (e) {
          return next(e);
        }
      };
      if (Object.keys(files).length === 0) {
        saveData();
      } else {
        const { oldPath, newPath } = setFilePath(files);
        fs.rename(oldPath, newPath, err => {
          if (err) return next(err);
          saveData(newPath);
        });
      }
    });
  }

  // 用户登陆
  async login(req, res, next) {
    const { account } = req.body;
    const emailLogin = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(account);
    const password = decrypt(req.body.password);
    try {
      const user = await User.findOne(emailLogin ? { email: account } : { username: account });
      if (user) {
        if (user.password !== encryptPwd(password)) return res.json({
          code: 400,
          msg: '登录密码不正确'
        });
        // 登陆成功 存储session信息 返回token给客户端
        req.session.token = user._id;
        req.session.userInfo = user;
        return res.json({
          code: 200,
          data: Object.assign({}, ...userInfoKeys.map(key => ({ [key]: user[key] }))),
          msg: '登陆成功'
        });
      }
      res.json({
        code: 400,
        msg: `${emailLogin ? '邮箱' : '用户名'}不存在`
      });
    } catch (e) {
      return next(e);
    }
  }

  // 自动登陆
  async autoLogin(req, res, next) {
    if (req.session.token === undefined) return res.json({
      code: 401,
      msg: '请先登录'
    });
    const _id = req.session.token;
    try {
      const user = await User.findOne({ _id }, userInfoKeys);
      if (!user) {
        // 清除上一次的userId
        req.session.cookie.maxAge = 0;
        return res.json({
          code: 401,
          msg: '请先登录'
        });
      }
      res.json({
        code: 200,
        data: user,
        msg: 'success'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 退出登陆
  async logout(req, res, next) {
    // 销毁session
    req.session.destroy(err => {
      if (err) return next(err);
    });
    res.json({
      code: 200,
      msg: '退出登陆成功'
    });
  }

  // 根据id获取用户信息
  async getUserMsg(req, res, next) {
    const { _id } = req.params;
    try {
      const user = await User.findById(_id, userInfoKeys);
      if (user) return res.json({
        code: 200,
        data: user,
        msg: 'success'
      });
      // 查询不到用户信息时销毁session
      req.session.cookie.maxAge = 0;
      res.json({
        code: 410,
        msg: '获取用户信息失败'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 修改用户信息
  async updateUserMsg(req, res, next) {
    const form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = config.uploadPath;
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) return next(err);
      const saveData = async newPath => {
        try {
          const { _id } = fields;
          const user = await User.findById(_id);
          if (!user) return res.json({
            code: 410,
            msg: '未获取到用户'
          });
          const keys = ['username', 'email', 'chatLimit', 'phone', 'status', 'openContext', 'stream', 'model'];
          keys.forEach(key => {
            if (fields[key]) user[snakeCase(key)] = fields[key];
          });
          if (newPath) user.photo = path.basename(newPath);
          await user.save();
          res.json({
            code: 200,
            data: user,
            msg: '修改成功'
          });
        } catch (e) {
          return next(e);
        }
      };
      if (Object.keys(files).length === 0) {
        saveData();
      } else {
        const { oldPath, newPath } = setFilePath(files);
        fs.rename(oldPath, newPath, err => {
          if (err) return next(err);
          saveData(newPath);
        });
      }
    });
  }

  // 修改密码
  async resetPwd(req, res, next) {
    const newPwd = decrypt(req.body.newPwd);
    try {
      const user = await User.findById(req.session.token);
      if (newPwd.length > pwdLimit) return res.json({
        code: 400,
        msg: `密码不能超出${pwdLimit}位`
      });
      user.password = encryptPwd(newPwd);
      await user.save();
      res.json({
        code: 200,
        msg: '修改密码成功'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 根据邮箱重置密码
  async resetPwdByEmail(req, res, next) {
    const { email } = req.body;
    const newPwd = decrypt(req.body.newPwd);
    try {
      const user = await User.findOne({ email });
      if (!user) return res.json({
        code: 400,
        msg: '邮箱不存在'
      });
      if (newPwd.length > pwdLimit) return res.json({
        code: 400,
        msg: `密码不能超出${pwdLimit}位`
      });
      user.password = encryptPwd(newPwd);
      await user.save();
      res.json({
        code: 200,
        msg: '密码修改成功'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 获取用户列表
  async getUserList(req, res, next) {
    const page = +req.body.page || 1;
    const pageSize = +req.body.pageSize || 20;
    const getData = '_id username status email';
    try {
      // skip 起始查询位置, limit 查询条数, exec 输出查询结果
      const user = await User.find({}, getData).skip((page - 1) * pageSize).limit(pageSize).exec();
      const count = await User.countDocuments();
      const totalPage = Math.ceil(count / pageSize); // 总页数
      res.json({
        code: 200,
        data: {
          list: user,
          total: count,
          totalPage
        },
        msg: 'success'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 删除用户
  async deleteUser(req, res, next) {
    const { _id } = req.params;
    User.deleteOne({ _id }, err => {
      if (err) return next(err);
      res.json({
        code: 200,
        msg: '删除用户成功'
      });
    });
  }
}

export default new UserController();
