const mongoose = require('mongoose');

const tagihanSchema = new mongoose.Schema(
  {
    total: Number,
    payment_photo: String,
    payment_time: Date,
    status: {
      type: String,
      enum: ['belum dibayar', 'menunggu konfirmasi', 'sudah dibayar'],
      default: 'belum dibayar',
    },
    payment_method: {
      type: String,
      enum: ['perbulan', 'perangkut'],
      default: 'perbulan',
    },
    pickup: {
      type: mongoose.Schema.ObjectId,
      ref: 'Pickup',
      required: true,
      default: null,
    },
  },
  {
    collection: 'tagihan',
  }
);

const Tagihan = mongoose.model('Tagihan', tagihanSchema);
module.exports = Tagihan;
