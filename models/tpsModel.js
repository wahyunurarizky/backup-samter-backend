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
    koordinator: String,
    tps_type: {
      type: String,
      enum: [
        'DIPO',
        'Lintas',
        'Bak Beton',
        'Pool Gerobak',
        'Pool Container',
        'TPS 3R',
      ],
    },
    tps_status_ownership: {
      type: String,
      enum: [
        'Dinas Lingkungan Hidup',
        'Pemerintah',
        'Swasta',
        'Perumahan',
        'Warga',
        'Bahu Jalan',
        'Bebas/Tidak Ada',
      ],
    },
    tps_area: Number,
    qr_id: {
      type: String,
      unique: true,
    },
    payment_method: {
      type: String,
      enum: ['perangkut', 'perbulan'],
      default: 'perbulan',
    },
  },
  {
    collection: 'tps',
  }
);

tpsSchema.index({ '$**': 'text' });

tpsSchema.pre('save', function (next) {
  const id = this._id;
  const str = id.toString().toUpperCase();

  this.qr_id = `TPS${str.substr(str.length - 6)}`;
  next();
});

const Tps = mongoose.model('Tps', tpsSchema);
module.exports = Tps;
