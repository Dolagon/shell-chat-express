import mongoose from 'mongoose';
import { getCurrentDateTime } from '../src/common';

const codeSchema = mongoose.Schema({
  email: { type: String, required: true },
  email_code: { type: Number, required: true },
  createdAt: { type: String },
  updatedAt: { type: String }
}, { timestamps: { currentTime: getCurrentDateTime } });

const Code = mongoose.model('Code', codeSchema);

export default Code;
