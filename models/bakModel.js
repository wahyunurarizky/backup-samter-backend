const mongoose = require('mongoose');
// autoIncrement = require('mongoose-auto-increment');

// const moment = require('moment');

const bakSchema = new mongoose.Schema(
  {
    empty_weight: {
      type: Number,
      required: true,
    },
    max_weight: {
      type: Number,
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
    collection: 'bak',
  }
);
bakSchema.index({ '$**': 'text' });

bakSchema.pre('save', function (next) {
  const date = this._id;
  const str = date.toString().toUpperCase();

  this.qr_id = `BAK${str.substr(str.length - 6)}`;
  next();
});

bakSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Bak = mongoose.model('Bak', bakSchema);
module.exports = Bak;
