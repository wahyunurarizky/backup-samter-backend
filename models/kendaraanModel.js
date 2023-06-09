const mongoose = require('mongoose');

const kendaraanSchema = new mongoose.Schema(
  {
    plat: {
      type: String,
      required: true,
      unique: true,
    },
    work_unit: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    kendaraan_type: {
      type: mongoose.Schema.ObjectId,
      ref: 'JenisKendaraan',
      required: true,
    },
    qr_id: {
      type: String,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: true,
    },
  },
  {
    collection: 'kendaraan',
  }
);
kendaraanSchema.index({ work_unit: 1, year: 1, plat: 1, qr_id: 1 });

kendaraanSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `KNDRN${str.substr(str.length - 6)}`;
  next();
});

kendaraanSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'kendaraan_type',
      select: ['type', 'empty_weight', 'max_load_weight'],
    },
  ]);
  next();
});

kendaraanSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Kendaraan = mongoose.model('Kendaraan', kendaraanSchema);
module.exports = Kendaraan;
