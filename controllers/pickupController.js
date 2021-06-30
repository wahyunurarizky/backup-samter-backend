const QRCode = require('qrcode');
// const moment = require('moment-timezone');
const Pickup = require('../models/pickupModel');
const Tps = require('../models/tpsModel');
const Bak = require('../models/bakModel');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const base = require('./baseController');
const Tagihan = require('../models/tagihanModel');
const APIFeatures = require('../utils/apiFeatures');

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
    console.log(kendaraan);
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
        new AppError('BAK Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const pickup = await Pickup.create({
      // qr_id,
      petugas: req.user._id,
      bak: bak._id,
      kendaraan: kendaraan._id,
      tps: tps._id,
      pickup_time: Date.now(),
      arrival_time: null,
      payment_method: req.body.payment_method,
    });

    await User.findByIdAndUpdate(req.user._id, { allowedPick: false });
    // await Tagihan.create({});

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
    let pickup;
    if (req.user.role === 'petugas') {
      const features = new APIFeatures(
        Pickup.find({ petugas: req.user._id }),
        req.query
      )
        .filter()
        .sort()
        .limit()
        .paginate();
      pickup = await features.query.populate();
    } else if (req.user.role === 'koordinator ksm') {
      const features = new APIFeatures(
        Pickup.find({ tps: req.user.tps }),
        req.query
      )
        .filter()
        .sort()
        .limit()
        .paginate();
      pickup = await features.query.populate();
    } else if (req.user.role === 'operator tpa') {
      const features = new APIFeatures(
        Pickup.find({ tpa: req.user.tpa }),
        req.query
      )
        .filter()
        .sort()
        .limit()
        .paginate();
      pickup = await features.query.populate();
    }

    if (!pickup)
      return next(new AppError('tidak ada data pickup untukmu', 404));
    res.status(201).json({
      success: true,
      code: '201',
      message: 'OK',
      data: {
        results: pickup.length,
        pickup,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = base.getAll(Pickup);
exports.get = base.getOne(Pickup);
exports.updateStatus = async (req, res, next) => {
  try {
    if (req.body.status === 'selesai' && req.user.role !== 'operator tpa') {
      return next(new AppError('tidak diizinkan merubah menjadi selesai', 403));
    }
    const pickup = await Pickup.findById(req.params.id);
    if (pickup.status === 'berhasil') {
      return next(new AppError('status tidak bisa diubah', 403));
    }

    // const filteredBody = filterObj(req.body, fields);
    const updatedDoc = await Pickup.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        // jangan lupa run validators pada update
        new: true,
        runValidators: true,
      }
    );
    if (!updatedDoc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    if (updatedDoc.status === 'tidak selesai') {
      await User.findByIdAndUpdate(updatedDoc.petugas._id, {
        allowedPick: true,
      });
    } else {
      await User.findByIdAndUpdate(updatedDoc.petugas._id, {
        allowedPick: false,
      });
    }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        doc: updatedDoc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getByQr = async (req, res, next) => {
  try {
    const pickup = await Pickup.findOne({ qr_id: req.params.qr_id });

    if (!pickup) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan id tersebut', 404)
      );
    }
    // if (pickup.pickup_time) {
    //   console.log(new Date(pickup.pickup_time));
    // }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.inputLoad = async (req, res, next) => {
  try {
    const checkPickup = await Pickup.findById(req.params.id);
    if (checkPickup.status === 'selesai')
      return next(new AppError('id pickup telah selesai digunakan', 400));

    const updatedPickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      {
        load: req.body.load,
        status: 'selesai',
        arrival_time: Date.now(),
        operator_tpa: req.user._id,
        tpa: req.user.tpa,
      },
      { new: true, runValidators: true }
    );
    if (!updatedPickup) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    await User.findByIdAndUpdate(updatedPickup.petugas, {
      allowedPick: true,
    });

    if (checkPickup.payment_method === 'perangkut') {
      await Tagihan.create({
        pickup: checkPickup._id,
        status: 'belum dibayar',
        payment_method: 'perangkut',
        price: updatedPickup.load * process.env.DEFAULT_PRICE_PER_KG,
        tps: checkPickup.tps,
      });
    }

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup: updatedPickup,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.generateQr = async (req, res, next) => {
  try {
    const doc = await Pickup.findOne({
      petugas: req.user._id,
      status: 'menuju tpa',
    });

    if (!doc) {
      return next(new AppError('tidak ada data', 404));
    }

    console.log(doc.qr_id);
    const stringdata = JSON.stringify(doc.qr_id);

    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const pickup = {
        pickup_id: doc._id,
        imgUrl: imgUrl,
      };
      if (err) return next(new AppError('Error Occured', 400));
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          pickup,
        },
      });
    });
  } catch (err) {
    next(err);
  }
};
exports.isAlreadyDone = async (req, res, next) => {
  try {
    if (!req.user.allowedPick)
      return next(
        new AppError(
          'belum selesai, segera timbang dan lapor operator tpa',
          403
        )
      );
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return next(new AppError('id salah', 400));
    }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAverage = async (req, res, next) => {
  try {
    let m;
    if (req.params.month || req.params.year) {
      m = new Date(req.params.year * 1 - 1, req.params.month * 1 - 1);
    } else {
      m = new Date(Date.now());
    }

    let objMatch = {};
    if (req.user.role === 'koordinator ksm') {
      objMatch = {
        tps: req.user.tps,
        arrival_time: {
          $gte: new Date(m.getFullYear(), m.getMonth()),
          $lt: new Date(m.getFullYear() + 1, m.getMonth() + 1),
        },
      };
    } else {
      objMatch = {
        arrival_time: {
          $gte: new Date(m.getFullYear(), m.getMonth()),
          $lt: new Date(m.getFullYear() + 1, m.getMonth() + 1),
        },
      };
    }

    const pickupEachWeek = await Pickup.aggregate([
      {
        $match: objMatch,
      },
      {
        $group: {
          _id: { $week: '$arrival_time' },
          total: { $sum: '$load' },
        },
      },
    ]);
    let sum = 0;
    pickupEachWeek.forEach((num) => {
      sum += num.total;
    });
    console.log(pickupEachWeek);
    const avgLoadWeek = sum / pickupEachWeek.length;

    const pickupThisMonth = await Pickup.aggregate([
      {
        $match: objMatch,
      },
      {
        $group: {
          _id: { $month: '$arrival_time' },
          total: { $sum: '$load' },
        },
      },
    ]);
    console.log(pickupThisMonth);
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        avgLoadWeek,
        totalLoad: pickupThisMonth[0] ? pickupThisMonth[0].total : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAverageWeekly = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      code: '200',
      message: 'ini dummy',
      data: {
        week1: 3000,
        week2: 4000,
        week3: 6500,
        week4: 2100,
      },
    });
  } catch (err) {
    next(err);
  }
};
