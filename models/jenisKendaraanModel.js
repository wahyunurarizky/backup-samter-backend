const mongoose = require('mongoose');

const jenisKendaraanSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
    },
    empty_weight: {
      type: Number,
      required: true,
    },
    max_load_weight: {
      type: Number,
      required: true,
    },
  },
  {
    collection: 'jenisKendaraan',
  }
);
jenisKendaraanSchema.index({ '$**': 'text' });

const JenisKendaraan = mongoose.model('JenisKendaraan', jenisKendaraanSchema);
module.exports = JenisKendaraan;
