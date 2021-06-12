const QRCode = require('qrcode');
const Checkout = require('../models/checkoutModel');
const Tps = require('../models/tpsModel');
const Bak = require('../models/bakModel');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');

exports.createCheckout = async (req, res, next) => {
  try {
    const kendaraan = await Kendaraan.findOne({ qr_id: req.body.kendaraan });
    if (!kendaraan)
      return next(
        new AppError(
          'Kendaraan Tidak Ditemukan, harap masukan ID yg benar',
          404
        )
      );

    const tps = await Tps.findOne({ qr_id: req.body.tps });
    if (!tps)
      return next(
        new AppError('TPS Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const bak = await Bak.findOne({ qr_id: req.body.bak });
    if (!bak)
      return next(
        new AppError('TPS Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const checkout = await Checkout.create({
      // qr_id,
      petugas: req.user._id,
      bak: bak._id,
      kendaraan: kendaraan._id,
      tps: tps._id,

      waktu_ambil: new Date(Date.now()),
    });

    const stringdata = JSON.stringify(checkout.qr_id);

    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const qrdata = {
        imgUrl: imgUrl,
      };
      if (err) return next(new AppError('Error Occured', 400));
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          checkout,
          qrdata,
        },
      });
    });
  } catch (err) {
    next(err);
  }
};
