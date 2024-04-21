import express from 'express';
import chatController from '../controller/chatController';

const router = express.Router({});

/**
 * @api {delete} /shell/api/chat/prompt 获取提示内容
 * @apiDescription 获取提示内容
 * @apiName promptLibrary
 * @apiGroup Chat
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "code": 200,
 *     "data": [
 *         {
 *             "id": "7463dc89",
 *             "title": "创建内容日历",
 *             "description": "用于一个TikTok账号",
 *             "prompt": "为点评房地产列表的TikTok账户创建内容日历。",
 *             "category": "write",
 *             "weight": 63
 *         }
 *     ],
 *     "msg": "success"
 * }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/chat/prompt', chatController.promptLibrary);

/**
 * @api {post} /shell/api/chat/completions 创建对话内容
 * @apiDescription 创建对话内容
 * @apiName ChatCompletions
 * @apiGroup Chat
 * @apiParam {String} [chatId] 对话id
 * @apiParam {String} [model=gpt-3.5-turbo] 模型
 * @apiParam {String} [stream=false] 显示方式
 * @apiParam {Array} messages 对话信息需包含山下文
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "code": 200,
 *     "data": {
 *         "id": "chatcmpl-902HjOxS94B1HLV7WP5fsBybNqZVl",
 *         "object": "chat.completion",
 *         "created": 1709795811,
 *         "model": "gpt-3.5-turbo-0125",
 *         "choices": [
 *             {
 *                 "index": 0,
 *                 "message": {
 *                     "role": "assistant",
 *                     "content": "..."
 *                 },
 *                 "logprobs": null,
 *                 "finish_reason": "stop"
 *             }
 *         ],
 *         "usage": {
 *             "prompt_tokens": 22,
 *             "completion_tokens": 253,
 *             "total_tokens": 275
 *         },
 *         "system_fingerprint": "fp_2b778c6b35"
 *     },
 *     "msg": "success"
 * }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/chat/completions', chatController.completions);

/**
 * @api {patch} /shell/api/chat/edit 修改对话标题
 * @apiDescription 修改对话标题
 * @apiName ChatEdit
 * @apiGroup Chat
 * @apiParam {String} _id 对话id
 * @apiParam {String} title 标题
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "修改成功"
 *  }
 * @apiVersion 1.0.0
 */
router.post('/shell/api/chat/edit', chatController.editChat);

/**
 * @api {get} /shell/api/chat/list 获取对话列表
 * @apiDescription 获取对话列表
 * @apiName ChatList
 * @apiGroup Chat
 * @apiParam {String} model 模型
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "code": 200,
 *     "data": [
 *         {
 *             "_id": "65e97b6b45b2dc2ebc2d6c05",
 *             "title": "test",
 *             "createdAt": "2024-03-07 16:31:39"
 *         }
 *     ],
 *     "msg": "success"
 * }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/chat/list/:model', chatController.getChatList);

/**
 * @api {get} /shell/api/chat/content/:id 获取对话内容
 * @apiDescription 获取对话内容
 * @apiName ChatContent
 * @apiGroup Chat
 * @apiParam {String} _id 对话id
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "修改成功"
 *  }
 * @apiVersion 1.0.0
 */
router.get('/shell/api/chat/content/:_id', chatController.getChatContent);

/**
 * @api {delete} /shell/api/chat/delete/:id 删除一项对话
 * @apiDescription 删除一项对话
 * @apiName ChatDelete
 * @apiGroup Chat
 * @apiParam {String} _id 对话id
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 200,
 *      "msg": "删除成功"
 *  }
 * @apiVersion 1.0.0
 */
router.delete('/shell/api/chat/delete/:_id', chatController.deleteChat);

export default router;
