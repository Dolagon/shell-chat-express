import express from 'express';
import userController from '../controller/userController';

const router = express.Router({});

/**
 * @api {post} /shell/api/user/add 添加用户
 * @apiDescription 添加用户或管理员
 * @apiName AddUser
 * @apiGroup User
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} email 邮箱
 * @apiParam {Number} [status=0] 0: 普通用户 1: 管理员
 * @apiParam {Number} [phone] 手机号
 * @apiParam {File} [photo] 用户头像
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "添加用户成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/add', userController.addUser);

/**
 * @api {post} /shell/api/user/login 用户登陆
 * @apiDescription 用户登陆
 * @apiName Login
 * @apiGroup User
 * @apiParam {String} account 用户名/邮箱
 * @apiParam {String} password 密码
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "登陆成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/login', userController.login);

/**
 * @api {get} /shell/api/user/auto-login 自动登陆
 * @apiDescription 根据session中的userid, 去查询对应的用户返回给客户端
 * @apiName AutoLogin
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "data": {
 *        "chat_limit": 10,
 *        "createdAt": "2024-03-12 17:10:50",
 *        "email": "123@qq.com",
 *        "phone": null,
 *        "photo": "default.png",
 *        "status": 0,
 *        "updatedAt": "2024-03-13 17:18:36",
 *        "username": "admin",
 *        "_id": "65f01c1ab039af403c7e0757"
 *      },
 *      "msg": "success"
 *  }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/user/auto-login', userController.autoLogin);

/**
 * @api {get} /shell/api/user/logout 退出登陆
 * @apiDescription 退出登陆
 * @apiName Logout
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "退出登陆成功"
 *  }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/user/logout', userController.logout);

/**
 * @api {get} /shell/api/user/msg/:_id 获取用户信息
 * @apiDescription 根据token获取用户信息
 * @apiName UserMessage
 * @apiGroup User
 * @apiParam {String} _id 用户id
 * @apiSuccessExample {json} Success-Response:
 * {
 *      "code": 200,
 *      "data": {
 *        "chat_limit": 10,
 *        "createdAt": "2024-03-12 17:10:50",
 *        "email": "123@qq.com",
 *        "phone": null,
 *        "photo": "default.png",
 *        "status": 0,
 *        "updatedAt": "2024-03-13 17:18:36",
 *        "username": "admin",
 *        "_id": "65f01c1ab039af403c7e0757"
 *      },
 *      "msg": "success"
 *  }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/user/msg/:_id', userController.getUserMsg);

/**
 * @api {post} /shell/api/user/edit 修改用户信息
 * @apiDescription 根据token修改用户或管理员信息
 * @apiName EditUser
 * @apiGroup User
 * @apiParam {String} _id 用户id
 * @apiParam {String} [username] 用户名
 * @apiParam {String} [email] 邮箱
 * @apiParam {String} [phone] 手机号
 * @apiParam {Number} [chatLimit] 可用对话次数
 * @apiParam {Boolean} [openContext] 开启上下文关联
 * @apiParam {Boolean} [stream] 开启流式传输
 * @apiParam {String} [model] gpt model
 * @apiParam {File} [photo] 用户头像
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "修改成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/edit', userController.updateUserMsg);

/**
 * @api {post} /shell/api/user/reset 修改用户密码
 * @apiDescription 根据token修改用户或管理员密码
 * @apiName ResetPassword
 * @apiGroup User
 * @apiParam {Number} newPwd 新密码
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "修改密码成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/reset', userController.resetPwd);

/**
 * @api {post} /shell/api/user/forget 重置密码
 * @apiDescription 通过邮箱重置密码
 * @apiName ResetPasswordByEmail
 * @apiGroup User
 * @apiParam {Number} email 邮箱
 * @apiParam {Number} newPwd 新密码
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "重置密码成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/forget', userController.resetPwdByEmail);

/**
 * @api {post} /shell/api/user/list 获取用户列表
 * @apiDescription 根据条件获取用户列表
 * @apiName UserList
 * @apiGroup User
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [pageSize=5] 每页的数量
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "data": {
 *        "list": [
 *         {
 *              "_id": "620287c21f17d917dcc5fd6e",
 *              "username": "admin",
 *              "status": 1,
 *              "phone": 939
 *          }
 *        ],
 *      "total": 5,
 *      "totalPage": 5
 *      },
 *      "msg": "success"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/user/list', userController.getUserList);

/**
 * @api {delete} /shell/api/user/remove/:_id 删除用户
 * @apiDescription 根据id删除用户
 * @apiName DeleteUser
 * @apiGroup User
 * @apiParam {Number} _id 用户id
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "删除成功"
 *  }
 * @apiVersion 1.0.0
 */
router.delete('/shell/api/user/remove/:_id', userController.deleteUser);

export default router;
