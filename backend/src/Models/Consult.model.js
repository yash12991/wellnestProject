// backend/models/consultationModels.js
const mongoose = require('mongoose');

// ConsultationSession
const consultationSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dietician: { type: mongoose.Schema.Types.ObjectId, ref: 'Dietician', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  //notes: { type: String },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
});
const ConsultationSession = mongoose.model('ConsultationSession', consultationSessionSchema);

// AISession
const aiSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AIMessage' }],
});
const AISession = mongoose.model('AISession', aiSessionSchema);

module.exports = { ConsultationSession, AISession };