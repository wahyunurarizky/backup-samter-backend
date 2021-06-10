const QRCode = require('qrcode');
const Kendaraan = require('../models/kendaraanModel');
const base = require('./baseController');

exports.create = base.createOne(
  Kendaraan,
  'plat_nomor',
  'unit_kerja',
  'tahun',
  'jenis_kendaraan_id'
);
exports.getAll = base.getAll(Kendaraan, { path: 'jenis_kendaraan_id' });
exports.get = base.getOne(Kendaraan);
exports.update = base.updateOne(Kendaraan);
exports.delete = base.deleteOne(Kendaraan);
exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Kendaraan.findById(req.params.id);
    const stringdata = JSON.stringify(doc._id);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return console.log('error occurred');
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const data = {
        kendaraanId: doc._id,
        imgUrl: imgUrl,
      };
      if (err) return console.log('error occurred');
      res.status(200).json({
        status: 'success',
        data: data,
      });
    });
  } catch (error) {
    next(error);
  }
};
