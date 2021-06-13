const mongoose = require('mongoose');
// autoIncrement = require('mongoose-auto-increment');

// const moment = require('moment');

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
  },
  {
    collection: 'kendaraan',
  }
);

kendaraanSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `KNDRN${str.substr(str.length - 6)}`;
  next();
});

// kendar

const Kendaraan = mongoose.model('Kendaraan', kendaraanSchema);
module.exports = Kendaraan;
