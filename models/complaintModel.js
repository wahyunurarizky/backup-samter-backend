const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
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
    default: 'terkirim',
    enum: ['terkirim', 'tidak selesai', 'selesai'],
    required: true,
  },
  solution: {
    type: String,
  },
});

complaintSchema.post('save', function (next) {
  this._doc.time = this.time.toLocaleString('id-ID', {
    hour12: false,
  });
});

complaintSchema.post(/^find/, (result) => {
  if (Array.isArray(result)) {
    result.forEach((e) => {
      if (e.time)
        e._doc.time = e.time.toLocaleString('id-ID', {
          hour12: false,
        });
      if (e.arrival_time)
        e._doc.arrival_time_local = e.arrival_time.toLocaleString('id-ID', {
          hour12: false,
        });
    });
  } else {
    if (result.time)
      result._doc.time = result.time.toLocaleString('id-ID', { hour12: false });
    if (result.arrival_time)
      result._doc.arrival_time_local = result.arrival_time.toLocaleString(
        'id-ID',
        { hour12: false }
      );
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
