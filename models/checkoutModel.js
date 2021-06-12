const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  qr_id: String,
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
    ref: 'Kendaraan',
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
  console.log(this._id);
});

const Checkout = mongoose.model('Checkout', checkoutSchema);
module.exports = Checkout;
