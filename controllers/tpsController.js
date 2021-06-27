const QRCode = require('qrcode');
const Tps = require('../models/tpsModel');
const base = require('./baseController');

exports.create = base.createOne(
  Tps,
  'name',
  'location',
  'capacity',
  'koordinator',
  'tps_type',
  'tps_area',
  'tps_status_ownership'
);
exports.getAll = base.getAll(Tps);
exports.get = base.getOne(Tps);
exports.update = base.updateOne(
  Tps,
  'name',
  'location',
  'capacity',
  'koordinator',
  'tps_type',
  'tps_area',
  'tps_status_ownership'
);
exports.delete = base.deleteOne(Tps);
exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Tps.findById(req.params.id);
    const stringdata = JSON.stringify(doc._id);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return console.log('error occurred');
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const data = {
        tpsId: doc._id,
        imgUrl: imgUrl,
      };
      if (err) return console.log('error occurred');
      res.status(200).json({
        success: true,
        code: '200',
        message: 'OK',
        data: data,
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotalTps = async (req, res, next) => {
  try {
    const total = await Tps.find();
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        total: total.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
