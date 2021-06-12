const Checkout = require('../models/checkoutModel');
const Tps = require('../models/tpsModel');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');
const QRCode = require('qrcode');

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
    // const tps = await Tps.findOne({ qr_id: req.body.tps });
    // if (!tps)
    //   return next(
    //     new AppError('TPS Tidak Ditemukan, harap masukan ID yg benar', 404)
    //   );

    const checkout = await Checkout.create({
      // qr_id,
      petugas: req.user._id,
      // bak: req.body.bak,
      kendaraan: kendaraan._id,
      // tps: tps._id,
      waktu_ambil: new Date(Date.now()),
    });
    // const date = checkout._id;
    // const str = date.toString().toUpperCase();
    // const qr_id = `CHCKT${str.substr(str.length - 6)}`;
    const stringdata = JSON.stringify(checkout._id);

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
