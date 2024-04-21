import mongoose from 'mongoose';
import { getCurrentDateTime } from '../src/common';

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Number, default: 0 }, // 用户身份 普通用户: 0 管理员: 1
  phone: { type: String, default: null },
  email: { type: String, required: true },
  photo: { type: String, default: 'default.png' }, // 用户头像
  chat_limit: { type: Number, default: 10 }, // 可用对话次数
  open_context: { type: Boolean, default: true }, // 开启上下文关联
  stream: { type: Boolean, default: true }, // 开启流式传输
  model: { type: String, default: 'gpt-3.5-turbo' },
  updatedAt: { type: String }
}, { timestamps: { currentTime: getCurrentDateTime } });

const User = mongoose.model('User', userSchema);

export default User;
