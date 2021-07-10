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
    default: 'Terkirim',
    required: true,
  },
  solution: {
    type: String,
  },
  endTime: Date,
});

complaintSchema.index({ '$**': 'text' });

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
      if (e.arrival_time)
        e._doc.arrival_time_local = e.arrival_time.toLocaleString('en-GB', {
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
    if (result.arrival_time)
      result._doc.arrival_time_local = result.arrival_time.toLocaleString(
        'en-GB',
        {
          timeZone: 'Asia/jakarta',
          hour12: false,
        }
      );
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
