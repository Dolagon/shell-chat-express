import mongoose from 'mongoose';
import { getCurrentDateTime } from '../src/common';

const errorSchema = mongoose.Schema({
  error_name: { type: String, required: true }, // 错误名称
  error_msg: { type: String, required: true }, // 错误信息
  error_stack: { type: String, required: true }, // 错误堆栈
  error_time: { type: Date, default: Date.now() }, // 发生时间
  createdAt: { type: String },
  updatedAt: { type: String }
}, { timestamps: { currentTime: getCurrentDateTime } });

const Error = mongoose.model('Error', errorSchema);

export default Error;
