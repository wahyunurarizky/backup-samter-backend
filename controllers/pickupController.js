const QRCode = require('qrcode');
// const moment = require('moment-timezone');
const Pickup = require('../models/pickupModel');
const Tps = require('../models/tpsModel');
const Bak = require('../models/bakModel');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');

exports.createPickup = async (req, res, next) => {
  try {
    if (!req.user.allowedPick)
      return next(
        new AppError(
          'tidak bisa pick up, selesaikan dulu pick up anda sebelumnya',
          400
        )
      );

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

    const pickup = await Pickup.create({
      // qr_id,
      petugas: req.user._id,
      bak: bak._id,
      kendaraan: kendaraan._id,
      tps: tps._id,
      pickup_time: new Date(Date.now()),
      arrival_time: null,
    });

    const stringdata = JSON.stringify(pickup.qr_id);

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
          pickup,
          qrdata,
        },
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyPickup = async (req, res, next) => {
  try {
    const pickup = await Pickup.find({ petugas: req.user._id });
    if (!pickup)
      return next(new AppError('tidak ada data pickup untukmu', 404));
    res.status(201).json({
      success: true,
      code: '201',
      message: 'OK',
      data: {
        pickup,
      },
    });
  } catch (err) {
    next(err);
  }
};

// exports.getALL();
