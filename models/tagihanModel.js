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
        'belum terbayar',
        'belum terverifikasi',
        'terverifikasi',
        'tidak terverifikasi',
      ],
      default: 'belum terbayar',
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
    qr_id: {
      type: String,
      unique: true,
    },
  },
  {
    collection: 'tagihan',
  }
);
tagihanSchema.index({ '$**': 'text' });

tagihanSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `TGN${str.substr(str.length - 6)}`;
  next();
});

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
      e._doc.payment_month_local = e.payment_month.toLocaleString('en-GB', {
        timeZone: 'Asia/jakarta',
        month: 'long',
        year: 'numeric',
      });
    });
  } else if (result) {
    if (!result.payment_month) return;
    result._doc.payment_month_local = result.payment_month.toLocaleString(
      'en-GB',
      { timeZone: 'Asia/jakarta', month: 'long', year: 'numeric' }
    );
  }
});

const Tagihan = mongoose.model('Tagihan', tagihanSchema);
module.exports = Tagihan;
