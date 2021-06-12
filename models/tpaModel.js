const mongoose = require('mongoose');

const tpaSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'name is required'],
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    // required: [true, 'tpa must have physical location'],
    // unique: [true, 'location must be unique'],
  },
  kecamatan: {
    type: String,
    // required: [true, 'tpa must be located in a kecamatan'],
  },
  kelurahan: {
    type: String,
    // required: [true, 'tpa must be located in a keluaran'],
  },
  kota: {
    type: String,
    // required: [true, 'tpa must be located in a kota'],
  },
  jenis_tpa: {
    type: String,
    // required: [true, 'tpa must be have type'],
  },
  luas_tpa: {
    type: Number,
    // required: [true, 'tpa must have area'],
  },
  kapasitas: {
    type: Number,
    // required: [true, 'tpa must have capacity'],
  },
  tonase: {
    type: String,
    // required: [true, 'tpa must have current tonnage'],
  },
  nama_koordinator: {
    type: String,
    // required: [true, 'tpa must have a coordinator'],
  },
  qr_id: {
    type: String,
    unique: true,
  },
});

tpaSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `TPA${str.substr(str.length - 6)}`;
  next();
});

const Tpa = mongoose.model('Tpa', tpaSchema);
module.exports = Tpa;
