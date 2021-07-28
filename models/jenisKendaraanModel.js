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
    isDeleted: {
      type: Boolean,
      default: false,
      select: true,
    },
  },
  {
    collection: 'jenisKendaraan',
  }
);
jenisKendaraanSchema.index({ type: 1 });

jenisKendaraanSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isDeleted: { $ne: true } });
  next();
});

const JenisKendaraan = mongoose.model('JenisKendaraan', jenisKendaraanSchema);
module.exports = JenisKendaraan;
