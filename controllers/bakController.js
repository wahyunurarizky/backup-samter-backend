const QRCode = require('qrcode');
const Bak = require('../models/bakModel');
const base = require('./baseController');

exports.create = base.createOne(Bak, 'empty_weight', 'max_weight');
exports.getAll = base.getAll(Bak, [], ['qr_id']);
exports.get = base.getOne(Bak);
exports.update = base.updateOne(Bak);
exports.delete = base.deleteOne(Bak);
exports.generateQr = async function generate(req, res, next) {
  try {
    const doc = await Bak.findById(req.params.id);
    const stringdata = JSON.stringify(doc._id);

    QRCode.toString(stringdata, { type: 'terminal' }, (err, QRcode) => {
      if (err) return console.log('error occurred');
      console.log(QRcode);
    });
    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const docs = {
        kendaraanId: doc._id,
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
