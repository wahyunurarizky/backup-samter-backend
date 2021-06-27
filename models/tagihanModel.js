const mongoose = require('mongoose');

const tagihanSchema = new mongoose.Schema(
  {
    price: Number,
    payment_photo: String,
    payment_time: Date,
    payment_month: {
      type: Date,
      default: null,
    },
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
    },
    tps: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tps',
    },
    description: String,
    selisih: {
      type: Number,
      default: process.env.DEFAULT_MONTHLY_PAYMENT,
    },
  },
  {
    collection: 'tagihan',
  }
);

tagihanSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'pickup',
      select: '-tps -tpa -petugas -bak -kendaraan -operator_tpa',
    },
    { path: 'tps', select: 'name' },
  ]);
  next();
});
tagihanSchema.post(/^find/, (result) => {
  if (Array.isArray(result)) {
    result.forEach((e) => {
      if (!e.payment_month) return;
      e._doc.payment_month_local = e.payment_month.toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    });
  } else if (result) {
    if (!result.payment_month) return;
    result._doc.payment_month_local = result.payment_month.toLocaleString(
      'id-ID',
      { month: 'long', year: 'numeric' }
    );
  }
});

const Tagihan = mongoose.model('Tagihan', tagihanSchema);
module.exports = Tagihan;
