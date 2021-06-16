const mongoose = require('mongoose');

const tagihanSchema = new mongoose.Schema(
  {
    price: Number,
    payment_photo: String,
    payment_time: Date,
    status: {
      type: String,
      enum: [
        'belum dibayar',
        'menunggu konfirmasi',
        'sudah dibayar',
        'tidak terverifikasi',
      ],
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
      default: null,
    },
    tps: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tps',
    },
  },
  {
    collection: 'tagihan',
  }
);

const Tagihan = mongoose.model('Tagihan', tagihanSchema);
module.exports = Tagihan;
