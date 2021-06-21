const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  nik: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  pict: {
    type: String,
    required: true,
    default: 'default-evidence-image.png',
  },
  desc: {
    type: String,
    required: true,
  },
  loc: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'terkirim',
    enum: ['terkirim', 'tidak selesai', 'selesai'],
    required: true,
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
