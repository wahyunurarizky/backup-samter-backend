const mongoose = require('mongoose');

const tpsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    capacity: Number,
    koordinator: {
      type: String,
    },
    tps_type: String,
    qr_id: {
      type: String,
      unique: true,
    },
  },
  {
    collection: 'tps',
  }
);

tpsSchema.pre('save', function (next) {
  const id = this._id;
  const str = id.toString().toUpperCase();

  this.qr_id = `TPS${str.substr(str.length - 6)}`;
  next();
});

const Tps = mongoose.model('Tps', tpsSchema);
module.exports = Tps;
