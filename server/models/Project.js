const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'sold', 'pending', 'rejected'], default: 'pending' },
  whatsIncluded: [{ type: String }],
  views: { type: Number, default: 0 },
  whatsappNumber: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
