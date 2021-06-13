const QRCode = require('qrcode');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');
const base = require('./baseController');

exports.create = base.createOne(
  Kendaraan,
  'plat',
  'work_unit',
  'year',
  'kendaraan_type',
  'qr_id'
);
exports.getAll = base.getAll(Kendaraan, { path: 'jenis_kendaraan_id' });
exports.get = base.getOne(Kendaraan);
exports.update = base.updateOne(Kendaraan);
exports.delete = base.deleteOne(Kendaraan);

exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Kendaraan.findById(req.params.id);
    console.log(doc._id);
    const stringdata = JSON.stringify(doc.qr_id);
    console.log(stringdata);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return next(new AppError('Error Occured', 400));
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const docs = {
        kendaraanId: doc._id,
        imgUrl: imgUrl,
      };
      if (err) return next(new AppError('Error Occured', 400));
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          docs,
        },
      });
    });
  } catch (error) {
    next(error);
  }
};
