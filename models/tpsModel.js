const mongoose = require('mongoose');

const tpsSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  lokasi: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
  },
  alamat: {
    type: String,
  },
  kecamatan: {
    type: String,
  },
  kelurahan: {
    type: String,
  },
  kapasitas: {
    type: Number,
  },
  koordinator: {
    type: String,
  },
  total_berat: {
    type: Number,
  },
});

const Tps = mongoose.model('Tps', tpsSchema);
module.exports = Tps;
