const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  qr_id: {
    type: String,
    unique: true,
  },
  time: Date,
  name: {
    type: String,
    required: true,
  },
  nik: {
    type: String,
    trim: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  kelurahan: {
    type: String,
    required: true,
  },
  kecamatan: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  pict: {
    type: String,
    required: true,
    default: 'default-evidence-image.png',
  },
  desc: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['terkirim', 'selesai', 'tidak selesai'],
    default: 'terkirim',
    required: true,
  },
  solution: {
    type: String,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
    select: false,
  },
});

complaintSchema.index({
  status: 1,
  time: 1,
  nik: 1,
  name: 1,
  kelurahan: 1,
  kecamatan: 1,
  address: 1,
  isArchived: 1,
});
// complaintSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ isArchived: { $ne: true } });
//   next();
// });

complaintSchema.pre('save', function (next) {
  const date = new Date(Date.now());
  const mil = date.getMilliseconds();
  const sec = date.getSeconds();
  const min = date.getMinutes();
  const hou = date.getHours();
  const day = date.getDay();
  const mon = date.getMonth();
  const yea = date.getFullYear();
  this.qr_id = `CMPLNT-${yea}${mon}${day}${hou}${min}${sec}${mil}`;
  next();
});

complaintSchema.post('save', function (next) {
  if (this.time) {
    this._doc.time = this.time.toLocaleString('en-GB', {
      timeZone: 'Asia/jakarta',
      hour12: false,
    });
  }
  if (this.endTime) {
    this._doc.endTime = this.endTime.toLocaleString('en-GB', {
      timeZone: 'Asia/jakarta',
      hour12: false,
    });
  }
});

complaintSchema.post(/^find/, (result) => {
  if (Array.isArray(result)) {
    result.forEach((e) => {
      if (e.time)
        e._doc.time = e.time.toLocaleString('en-GB', {
          timeZone: 'Asia/jakarta',
          hour12: false,
        });
      if (e.endTime)
        e._doc.endTime = e.endTime.toLocaleString('en-GB', {
          timeZone: 'Asia/jakarta',
          hour12: false,
        });
    });
  } else {
    if (result.time)
      result._doc.time = result.time.toLocaleString('en-GB', {
        timeZone: 'Asia/jakarta',
        hour12: false,
      });
    if (result.endTime)
      result._doc.endTime = result.endTime.toLocaleString('en-GB', {
        timeZone: 'Asia/jakarta',
        hour12: false,
      });
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
