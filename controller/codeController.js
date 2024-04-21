import config from '../src/config';
import { nodeMail } from '../src/common';
import Code from '../models/Code';

class CodeController {
  constructor() {
  }

  // 发送邮箱验证码
  async sendEmailCode(req, res, next) {
    const email = req.body.email;
    if (!email) return res.json({
      code: 400,
      msg: '邮箱不能为空'
    });
    // 生成4位随机验证码
    const code = String(Math.floor(Math.random() * 10000)).padEnd(4, '0');
    const mail = {
      from: config.sendEmail,
      subject: '验证码',
      to: email,
      html: `
      <table class="full-width" align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;">
        <tbody>
          <tr>
            <td bgcolor="#ffffff" style="border-top:4px solid #FA0F00; background-color:#ffffff; padding-bottom:60px;">
              <table class="email-width" align="center" width="500" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:500px;">
                <tbody>
                  <tr>
                    <td style="color:#FF3C00; font-family:adobe-clean, Helvetica Neue, Helvetica, Verdana, Arial, sans-serif; font-size:12px; line-height:18px; padding-top:50px;"></td>
                  </tr>
                  <tr>
                    <td style="color:#505050; font-family:adobe-clean, Helvetica Neue, Helvetica, Verdana, Arial, sans-serif; font-size:18px; line-height:26px; padding-top:65px;">
                      您的验证码为：<br><br> <strong style="font-size:28px; line-height:32px;">${code}</strong><br><br>
                      2分钟内有效，如果不是您本人操作，请无视此邮件。<br>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      `
    };
    await nodeMail.sendMail(mail, async (err, info) => {
      if (err) return next(err);
      try {
        const result = await Code.create({
          email,
          email_code: code
        });
        if (result) {
          res.json({
            code: 200,
            msg: '验证码已发送至邮箱'
          });
          setTimeout(() => {
            // 计时结束删除code
            Code.deleteOne({ email }, err => {
              if (err) return next(err);
              console.log('del email success');
            });
          }, 60000 * 2);
        }
      } catch (e) {
        return next(e);
      }
    });
  }

  // 验证邮箱验证码
  async verifyEmailCode(req, res, next) {
    const { email, code } = req.body;
    if (!code) return res.json({
      code: 400,
      msg: '验证码不能为空'
    });
    try {
      const result = await Code.findOne({ email }, 'email_code').sort({ _id: -1 }).exec();
      if (!result) return res.json({
        code: 410,
        msg: '未获取到验证码，请重新验证'
      });
      if (+code !== result.email_code) return res.json({
        code: 400,
        msg: '验证码不正确'
      });
      res.json({
        code: 200,
        msg: '验证通过'
      });
      await Code.deleteMany({ email });
    } catch (e) {
      return next(e);
    }
  }
}

export default new CodeController();
