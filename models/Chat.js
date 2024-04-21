import mongoose from 'mongoose';
import { getCurrentDateTime } from '../src/common';

const chatSchema = mongoose.Schema({
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  model: { type: String, default: 'gpt-3.5-turbo' },
  chat_content: { type: Array, default: [] }, // 对话内容
  createdAt: { type: String },
  updatedAt: { type: String }
}, { timestamps: { currentTime: getCurrentDateTime } });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
