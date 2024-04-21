import httpsProxyAgent from 'https-proxy-agent';
import OpenAI from 'openai';
import Chat from '../models/Chat';
import { getCurrentDateTime, usableGptModelMap } from '../src/common';
import { last } from 'lodash/array';
import config from '../src/config';
import { assign } from 'lodash';
import User from '../models/User';

const { HttpsProxyAgent } = httpsProxyAgent;
const httpAgent = new HttpsProxyAgent(config.httpsProxy); // 国内走代理
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class ChatController {
  constructor() {
  }

  // 获取提示
  async promptLibrary(req, res, next) {
    const promptLibrary = [
      {
        'id': '7463dc89',
        'title': '创建内容日历',
        'description': '用于一个TikTok账号',
        'prompt': '为点评房地产列表的TikTok账户创建内容日历。',
        'category': 'write',
        'weight': 63
      },
      {
        'id': 'd9887b64',
        'title': '告诉我一个有趣的事实',
        'description': '关于金州勇士队',
        'prompt': '告诉我一个关于金州勇士队的随机趣事',
        'category': 'misc',
        'weight': 45
      },
      {
        'id': 'e5887b58',
        'title': '写一份感谢信',
        'description': '给我课程的客座讲师',
        'prompt': '你能给来我们班级分享她职业生涯的客座讲师写一封简短的感谢信吗？大家都说这非常鼓舞人心。',
        'category': 'write',
        'weight': 56
      },
      {
        'id': '0895e32d',
        'title': '头脑风暴命名',
        'description': '我们即将从收容所领养的一只橘色猫咪',
        'prompt': '为我们即将从收容所领养的橘猫起十个名字，并提供一些昵称选项。',
        'category': 'idea',
        'weight': 47
      },
      {
        'id': '9575d31b',
        'title': '规划一次旅行',
        'description': '探索土耳其卡帕多西亚的岩石地貌',
        'prompt': '我想去土耳其卡帕多西亚看岩石地貌。你能帮我规划一个3天的行程吗？',
        'category': 'travel',
        'weight': 42
      },
      {
        'id': '30578287',
        'title': '帮我选择',
        'description': '给我爱钓鱼的爸爸的一份礼物',
        'prompt': '你能为我爱钓鱼的爸爸想出一些创意礼物的主意吗？但请不要包括任何钓鱼装备。',
        'category': 'shop',
        'weight': 46
      },
      {
        'id': '8ef7d653',
        'title': '推荐有趣的活动',
        'description': '帮助我在新城市交朋友',
        'prompt': '我刚搬到一个新城市，想交朋友。有什么有趣的活动可以帮助我做到这一点吗？',
        'category': 'idea',
        'weight': 14
      },
      {
        'id': 'bd372e53',
        'title': '推荐活动',
        'description': '用于远程员工的团队建设日',
        'prompt': '你能推荐几个适合团建日的破冰活动吗？我们有远程员工，想让他们也感到被包括。',
        'category': 'idea',
        'weight': 43
      },
      {
        'id': 'd4675c8e',
        'title': '解释期权交易',
        'description': '如果我熟悉买卖股票',
        'prompt': '如果您熟悉股票买卖，请简单介绍一下期权交易。',
        'category': 'teach-or-explain',
        'weight': 54
      }
    ];
    const shuffledArray = promptLibrary.sort(() => Math.random() - 0.5);

    res.json({
      code: 200,
      data: shuffledArray.slice(0, 4),
      msg: 'success'
    });
  }

  // 创建对话内容
  async completions(req, res, next) {
    let stream = false;
    try {
      // 获取剩余可用次数
      const user = await User.findById(req.session.token);
      const { chat_limit } = user;
      const { chatId, messages, model = 'gpt-3.5-turbo' } = req.body;
      stream = req.body.stream;
      let errMsg = '';
      if (!Object.keys(usableGptModelMap).includes(model)) {
        errMsg = `${model}模型不可用`;
        if (stream) {
          res.writeHead(200, { 'Content-Type': 'text/event-stream' });
          res.write(`data: ${JSON.stringify({ err: errMsg })}\n\n`);
          res.end();
          return;
        }
        return res.json({
          code: 400,
          msg: errMsg
        });
      }
      if (chat_limit <= 0 || chat_limit - usableGptModelMap[model].consume < 0) {
        errMsg = '次数已用完';
        if (stream) {
          res.writeHead(200, { 'Content-Type': 'text/event-stream' });
          res.write(`data: ${JSON.stringify({ err: errMsg })}\n\n`);
          res.end();
          return;
        }
        return res.json({
          code: 403,
          msg: errMsg
        });
      }
      const { token: userId, userInfo } = req.session;
      const body = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages
        ],
        model,
        stream,
        temperature: 0
      };
      let data = {};
      const chatCompletion = await openai.chat.completions.create(body);
      if (chatCompletion?.error) throw new Error(chatCompletion.error.message);
      const currentDateTime = getCurrentDateTime();
      const num = Math.max(chat_limit - usableGptModelMap[model].consume, 0);
      if (stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' }); // 'text/event-stream' 标识 SSE
        let contentStr = '';
        let lastChunk = {};
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          contentStr += content;
          // process.stdout.write(content);
          lastChunk = chunk;
          res.write(`data: ${JSON.stringify(assign(chunk, {
            createTime: currentDateTime,
            chatLimit: num
          }))}\n\n`); // 格式必须是 `data: xxx\n\n`
        }
        if (lastChunk === undefined) throw new Error('Stream is empty');
        lastChunk.choices[0].message = {
          role: 'assistant',
          content: contentStr
        };
        data = lastChunk;
      } else {
        data = chatCompletion;
        res.json({
          code: 200,
          data: assign(data, { createTime: currentDateTime, chatLimit: num }),
          msg: 'success'
        });
      }
      const { content } = last(messages);
      const chatContent = {
        ask: content, // 请求内容
        reply: data, // 返回内容
        createTime: currentDateTime
      };
      if (chatId) {
        // 追加对话内容
        const chat = await Chat.findById(chatId, 'chat_content');
        chat.chat_content = [...chat.chat_content, chatContent];
        await chat.save();
      } else {
        // 创建一项对话
        await Chat.create({
          user_id: userId,
          title: content,
          model,
          chat_content: [chatContent]
        });
      }
      user.chat_limit = num;
      await user.save();
    } catch (e) {
      if (stream) e.chatStream = true;
      return next(e);
    }
  }

  // 修改对话标题
  async editChat(req, res, next) {
    const { _id, title } = req.body;
    try {
      const chat = await Chat.findById(_id, 'chat_info');
      if (!chat) return res.json({
        code: 410,
        msg: '未获取到对话'
      });
      chat.title = title;
      await chat.save();
      res.json({
        code: 200,
        msg: '修改成功'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 获取对话列表
  async getChatList(req, res, next) {
    try {
      const { model } = req.params;
      const getData = '_id title createdAt';
      const chat = await Chat.find({ user_id: req.session.token, model }, getData).sort({ _id: -1 });
      res.json({
        code: 200,
        data: chat,
        msg: 'success'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 获取对话内容
  async getChatContent(req, res, next) {
    try {
      const { _id } = req.params;
      const content = await Chat.findById(_id);
      if (!content) return res.json({
        code: 410,
        msg: '未获取到对话内容'
      });
      res.json({
        code: 200,
        data: content.chat_content,
        msg: 'success'
      });
    } catch (e) {
      return next(e);
    }
  }

  // 删除一个对话
  async deleteChat(req, res, next) {
    const { _id } = req.params;
    Chat.deleteOne({ _id }, err => {
      if (err) return next(err);
      res.json({
        code: 200,
        msg: '删除成功'
      });
    });
  }
}

export default new ChatController;
