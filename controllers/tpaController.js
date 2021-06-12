const QRCode = require('qrcode');
const Tpa = require('../models/tpaModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const base = require('./baseController');

exports.create = base.createOne(
  Tpa,
  'nama',
  'location',
  'kecamatan',
  'kelurahan',
  'kota',
  'jenis_tpa',
  'luas_tpa',
  'kapasitas',
  'tonase',
  'nama_koordinator'
);
exports.getAll = base.getAll(Tpa);
exports.get = base.getOne(Tpa);
exports.update = base.updateOne(Tpa);
exports.delete = base.deleteOne(Tpa);

exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Tpa.findById(req.params.id);
    const stringdata = JSON.stringify(doc._id);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return console.log('error occurred');
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const docs = {
        TpaId: doc._id,
        imgUrl: imgUrl
      };
      if (err) return console.log('error occurred');
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          docs,
        }
      });
    });
  } catch (error) {
    next(error);
  }
};
