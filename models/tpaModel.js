const mongoose = require('mongoose');

const tpaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  plat_nomor: {
    type: String,
    required: [true, 'plat_nomor is required'],
    unique: [true, 'plat_nomor is unique']
  },
  location:{
    type: "Point",
    coordinates: [0, 0],
    required: [true, 'tpa must have physical location'],
    unique: [true, 'location must be unique']
  },
  kecamatan:{
    type: String,
    requred: [true, 'tpa must be located in a kecamatan']
  },
  kelurahan:{
    type: String,
    requred: [true, 'tpa must be located in a keluaran']
  },
  kota:{
    type: String,
    requred: [true, 'tpa must be located in a kota']
  },
  jenis_tpa:{
    type: String,
    requred: [true, 'tpa must be have type']
  },
  luas_tpa:{
    type: Number,
    requred: [true, 'tpa must have area']
  },
  kapasitas:{
    type: Number,
    requred: [true, 'tpa must have capacity']
  },
  tonase:{
    type: String,
    requred: [true, 'tpa must have current tonnage']
  },
  nama_koordinator:{
    type: String,
    requred: [true, 'tpa must have a coordinator']
  }
});

const Tpa = mongoose.model('Tpa', tpaSchema);
module.exports = Tpa;
