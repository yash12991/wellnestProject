// backend/models/aiModels.js
const mongoose = require('mongoose');

// AI
const aiSchema = new mongoose.Schema({
  modelName: { type: String, required: true }, // e.g., 'gemini-1.5-flash'
  apiKey: { type: String }, // Stored securely, perhaps encrypted
  endpoint: { type: String },
});
const AI = mongoose.model('AI', aiSchema);

// AIChat
const aiChatSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AISession', required: true },
  type: { type: String, enum: ['general', 'dietician', 'mealplan'] },
  timestamp: { type: Date, default: Date.now },
});
const AIChat = mongoose.model('AIChat', aiChatSchema);

// AIMessage
const aiMessageSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'AISession', required: true },
  sender: { type: String, enum: ['user', 'ai'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const AIMessage = mongoose.model('AIMessage', aiMessageSchema);

// AIToken
const aiTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tokensUsed: { type: Number, default: 0 },
  limit: { type: Number }, // e.g., daily limit
  lastReset: { type: Date },
});
const AIToken = mongoose.model('AIToken', aiTokenSchema);

module.exports = { AI, AIChat, AIMessage, AIToken };