const QRCode = require('qrcode');
const Tpa = require('../models/tpaModel');
const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

exports.create = base.createOne(
  Tpa,
  'name',
  'location',
  'tpa_type',
  'tpa_area',
  'capacity',
  'tonase',
  'koordinator',
  'qr_id'
);
exports.getAll = base.getAll(
  Tpa,
  [],
  ['name', 'tpa_type', 'qr_id', 'koordinator']
);
exports.get = base.getOne(Tpa);
exports.update = base.updateOne(Tpa);
// exports.delete = base.deleteOne(Tpa);
exports.delete = async (req, res, next) => {
  try {
    const doc = await Tpa.findByIdAndUpdate(req.params.id, {
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
    const doc = await Tpa.findById(req.params.id);
    const stringdata = JSON.stringify(doc._id);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return console.log('error occurred');
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const docs = {
        TpaId: doc._id,
        imgUrl: imgUrl,
      };
      if (err) return console.log('error occurred');
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
