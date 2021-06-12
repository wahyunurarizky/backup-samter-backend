const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
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
  waktu_ambil: Date,
  waktu_checkout: Date,
  status: {
    type: String,
    enum: ['menuju tpa', 'selesai'],
    default: 'menuju tpa',
  },
  muatan: Number,
  metode_pembayaran: {
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

checkoutSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `CHCKT${str.substr(str.length - 6)}`;
  next();
});

const Checkout = mongoose.model('Checkout', checkoutSchema);
module.exports = Checkout;
