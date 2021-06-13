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
    enum: ['menuju tpa', 'selesai'],
    default: 'menuju tpa',
  },
  load: Number,
  payment_method: {
    type: String,
    enum: ['perbulan', 'perorder'],
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

const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;
