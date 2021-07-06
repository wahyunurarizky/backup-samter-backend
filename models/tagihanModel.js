const mongoose = require('mongoose');

const tagihanSchema = new mongoose.Schema(
  {
    price: Number,
    payment_photo: String,
    payment_time: {
      type: Date,
      default: null,
    },
    payment_payed_time: {
      type: Date,
      default: null,
    },
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
    pembayar: {
      type: String,
      default: null,
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
tagihanSchema.pre('insertMany', function (next) {
  console.log(this);

  // const date = this._id;
  // const str = date.toString().toUpperCase();

  // this.qr_id = `TGN${str.substr(str.length - 6)}`;
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
      if (e.payment_month) {
        e._doc.payment_month_local = e.payment_month.toLocaleString('id-ID', {
          timeZone: 'Asia/jakarta',
          month: 'long',
          year: 'numeric',
        });
      }
      if (e.payment_time) {
        e._doc.payment_time_local = e.payment_time.toLocaleString('en-GB', {
          timeZone: 'Asia/jakarta',
        });
      }
      if (e.payment_payed_time) {
        e._doc.payment_payed_time_local = e.payment_payed_time.toLocaleString(
          'en-GB',
          {
            timeZone: 'Asia/jakarta',
          }
        );
      }
    });
  } else if (result) {
    if (result.payment_month)
      result._doc.payment_month_local = result.payment_month.toLocaleString(
        'id-ID',
        { timeZone: 'Asia/jakarta', month: 'long', year: 'numeric' }
      );

    if (result.payment_time)
      result._doc.payment_time_local = result.payment_time.toLocaleString(
        'en-GB',
        {
          timeZone: 'Asia/jakarta',
        }
      );
    if (result.payment_payed_time)
      result._doc.payment_payed_time_local =
        result.payment_payed_time.toLocaleString('en-GB', {
          timeZone: 'Asia/jakarta',
        });
  }
});

const Tagihan = mongoose.model('Tagihan', tagihanSchema);
module.exports = Tagihan;
