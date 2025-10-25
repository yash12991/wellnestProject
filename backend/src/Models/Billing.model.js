// backend/models/subscriptionModels.js
const mongoose = require('mongoose');

// BillingInformation
const billingInformationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionType: { type: String, enum: ['free', 'premium'] },
  paymentMethod: { type: String }, // e.g., 'credit card'
  cardLast4: { type: String },
  billingAddress: { type: String },
  nextBillingDate: { type: Date },
  status: { type: String, enum: ['active', 'cancelled', 'past_due'], default: 'active' },
});
const BillingInformation = mongoose.model('BillingInformation', billingInformationSchema);

module.exports = { BillingInformation };