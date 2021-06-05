const mongoose = require('mongoose');

const tpsSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  lokasi: {
    type: 'Point',
    coordinates: [0, 0],
    required: true,
    unique: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  kecamatan: {
    type: String,
    required: true,
  },
  kelurahan: {
    type: String,
    required: true,
  },
  kapasitas: {
    type: Number,
    required: true,
  },
  koordinator: {
    type: String,
    required: true,
  },
  total_berat: {
    type: Number,
    required: true,
  },
});

const Tps = mongoose.model('Tps', tpsSchema);
module.exports = Tps;
