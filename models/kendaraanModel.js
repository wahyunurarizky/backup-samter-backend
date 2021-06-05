const mongoose = require('mongoose');

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
});

const Kendaraan = mongoose.model('Kendaraan', kendaraanSchema);
module.exports = Kendaraan;
