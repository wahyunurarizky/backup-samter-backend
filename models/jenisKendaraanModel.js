const mongoose = require('mongoose');

const jenisKendaraanSchema = new mongoose.Schema({
  jenis: {
    type: String,
    required: true,
    unique: true,
  },
  berat_kosong: {
    type: Number,
    required: true,
  },
  berat_muatan_maksimal: {
    type: Number,
    required: true,
  },
});

const JenisKendaraan = mongoose.model('JenisKendaraan', jenisKendaraanSchema);
module.exports = JenisKendaraan;
