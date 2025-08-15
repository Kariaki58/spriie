import mongoose, { Schema } from "mongoose";

const emailJobSchema = new Schema({
  to: { type: String, required: true },
  from: { type: String, default: "Spriie <contact@spriie.com>" },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  sent: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  failed: { type: Boolean, default: false },
  failedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.EmailJob ||
  mongoose.model("EmailJob", emailJobSchema);
