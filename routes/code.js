import express from 'express';
import codeController from '../controller/codeController';

const router = express.Router({});

/**
 * @api {post} /shell/api/code/send 发送验证码
 * @apiDescription 发送验证码
 * @apiName SendCode
 * @apiGroup Code
 * @apiParam {String} email 邮箱
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "验证码发送成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/code/send', codeController.sendEmailCode);

/**
 * @api {post} /shell/api/code/verify 验证邮箱
 * @apiDescription 验证邮箱
 * @apiName VerifyCode
 * @apiGroup Code
 * @apiParam {String} email 邮箱
 * @apiParam {String} code 验证码
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "验证通过"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/code/verify', codeController.verifyEmailCode);

export default router;
