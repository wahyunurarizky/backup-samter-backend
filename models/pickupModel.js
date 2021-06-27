const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  qr_id: {
    type: String,
    unique: true,
  },
  petugas: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  bak: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bak',
  },
  kendaraan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Kendaraan',
  },
  tps: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tps',
  },
  pickup_time: Date,
  arrival_time: Date,
  status: {
    type: String,
    enum: ['menuju tpa', 'selesai', 'terlambat'],
    default: 'menuju tpa',
  },
  load: Number,
  payment_method: {
    type: String,
    enum: ['perbulan', 'perangkut'],
    default: 'perbulan',
  },
  operator_tpa: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  tpa: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tpa',
  },
});

pickupSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `PCKP${str.substr(str.length - 6)}`;
  next();
});

pickupSchema.post('save', function (next) {
  this._doc.pickup_time_local = this.pickup_time.toLocaleString('id-ID', {
    hour12: false,
  });
});

pickupSchema.post(/^find/, (result) => {
  console.log(!this.pickup_time);
  if (result) {
    if (Array.isArray(result)) {
      result.forEach((e) => {
        if (e.pickup_time)
          e._doc.pickup_time_local = e.pickup_time.toLocaleString('id-ID', {
            hour12: false,
          });
        if (e.arrival_time)
          e._doc.arrival_time_local = e.arrival_time.toLocaleString('id-ID', {
            hour12: false,
          });
      });
    } else {
      if (result.pickup_time)
        result._doc.pickup_time_local = result.pickup_time.toLocaleString(
          'id-ID',
          { hour12: false }
        );
      if (result.arrival_time)
        result._doc.arrival_time_local = result.arrival_time.toLocaleString(
          'id-ID',
          { hour12: false }
        );
    }
  }
});

pickupSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'petugas',
      select: ['name', 'NIP', 'photo'],
    },
    {
      path: 'bak',
      select: 'qr_id',
    },
    {
      path: 'kendaraan',
      select: ['plat', 'qr_id'],
    },
    {
      path: 'tps',
      select: ['qr_id', 'name'],
    },
    {
      path: 'operator_tpa',
      select: ['name'],
    },
    {
      path: 'tpa',
      select: ['name'],
    },
  ]);
  next();
});

const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;
