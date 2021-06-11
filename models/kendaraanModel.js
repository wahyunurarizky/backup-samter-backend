const mongoose = require('mongoose');
// autoIncrement = require('mongoose-auto-increment');

// const moment = require('moment');

const kendaraanSchema = new mongoose.Schema({
  plat_nomor: {
    type: String,
    required: true,
    unique: true,
  },
  unit_kerja: {
    type: String,
    required: true,
  },
  tahun: {
    type: Number,
    required: true,
  },
  jenis_kendaraan_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'JenisKendaraan',
    required: true,
  },
  qr_id: {
    type: String,
    unique: true,
  },
});

kendaraanSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `KNDRN${str.substr(str.length - 6)}`;
  next();
});

// kendar

const Kendaraan = mongoose.model('Kendaraan', kendaraanSchema);
module.exports = Kendaraan;
