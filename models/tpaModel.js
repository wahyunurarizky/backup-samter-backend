const mongoose = require('mongoose');

const tpaSchema = new mongoose.Schema(
  {
    name: {
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
      city: String,
      kecamatan: String,
      kelurahan: String,
    },

    tpa_type: String,
    tpa_area: Number,
    capacity: Number,
    tonase: Number,
    koordinator: String,
    qr_id: {
      type: String,
      unique: true,
    },
  },
  {
    collection: 'tpa',
  }
);

tpaSchema.index({ '$**': 'text' });

tpaSchema.pre('save', function (next) {
  const id = this._id;
  const str = id.toString().toUpperCase();

  this.qr_id = `TPA${str.substr(str.length - 6)}`;
  next();
});

const Tpa = mongoose.model('Tpa', tpaSchema);
module.exports = Tpa;
