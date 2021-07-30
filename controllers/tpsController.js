const QRCode = require('qrcode');
const Tps = require('../models/tpsModel');
const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

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
exports.getAll = base.getAll(
  Tps,
  [],
  [
    'name',
    'tps_type',
    'qr_id',
    'payment_method',
    'tps_status_ownership',
    'koordinator',
  ]
);
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
// exports.delete = base.deleteOne(Tps);
exports.delete = async (req, res, next) => {
  try {
    const doc = await Tps.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    const deletedUsers = await User.updateMany(
      { tps: doc._id },
      {
        isDeleted: true,
      }
    );
    console.log(deletedUsers);
    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    res.status(204).json({
      success: true,
      code: '204',
      message: 'OK',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Tps.findById(req.params.id);
    const stringdata = doc.qr_id;

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
