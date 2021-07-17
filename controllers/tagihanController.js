const multer = require('multer');
const sharp = require('sharp');
const Tagihan = require('../models/tagihanModel');
const Pickup = require('../models/pickupModel');
const Tps = require('../models/tpsModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// exports.create = base.createOne(Tagihan, 'total', 'bukti', 'waktu', 'status');
exports.getAll = base.getAll(Tagihan, [
  { path: 'pickup', select: 'load' },
  { path: 'tps', select: 'name' },
]);
exports.get = base.getOne(Tagihan);
exports.updateStatus = base.updateOne(Tagihan, 'status', 'description');
exports.delete = base.deleteOne(Tagihan);

exports.getMyTagihan = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Tagihan.find({ tps: req.user.tps }),
      req.query
    )
      .filter()
      .sort()
      .limit()
      .paginate();
    const tagihan = await features.query;

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        results: tagihan.length,
        tagihan,
      },
    });
  } catch (err) {
    next(err);
  }
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Bukan gambar!, mohon hanya upload file gambar', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPaymentPhoto = upload.single('payment_photo');

exports.resizePaymentPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.file.filename = `bukti-${req.params.id}.jpeg`;

    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 60 })
      .toFile(`public/img/bukti/${req.file.filename}`);

    next();
  } catch (err) {
    next(err);
  }
};
exports.pay = async (req, res, next) => {
  const tagihan = await Tagihan.findById(req.params.id);
  if (!tagihan) {
    return new AppError('id tagihan tidak ada', 400);
  }

  if (tagihan.tps._id.toString() !== req.user.tps.toString()) {
    return next(
      new AppError('kamu tidak bisa membayar tagihan orang lain', 403)
    );
  }

  if (tagihan.status === 'terverifikasi') {
    return next(new AppError('sudah berhasil dibayar', 401));
  }

  if (req.file) req.body.payment_photo = req.file.filename;
  const payment = await Tagihan.findByIdAndUpdate(
    req.params.id,
    {
      payment_photo: `${process.env.URL}img/bukti/${req.body.payment_photo}`,
      status: 'belum terverifikasi',
      pembayar: req.user.name,
      payment_payed_time: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    code: '200',
    message: 'OK',
    data: {
      user: payment,
    },
  });
};

exports.createTagihanMonthly = async () => {
  try {
    const m = new Date(Date.now());

    let pickup = await Pickup.aggregate([
      {
        $match: {
          payment_method: 'perbulan',
          arrival_time: {
            // PENTING {GANTI}
            $gte: new Date(m.getFullYear() - 1, m.getMonth() - 1),
            $lt: new Date(m.getFullYear(), m.getMonth()),
          },
        },
      },
      {
        $group: {
          _id: '$tps',
          totalLoad: { $sum: '$load' },
        },
      },
      {
        $addFields: {
          tps: '$_id',
          status: 'belum terbayar',
          payment_method: 'perbulan',
          payment_month: new Date(m.getFullYear(), m.getMonth()),
          payment_time: new Date(m.getFullYear(), m.getMonth()),
          price: {
            $multiply: ['$totalLoad', process.env.DEFAULT_PRICE_PER_KG * 1],
          },
        },
      },
      // menghapus atau tidak menampilkan id
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    const neObj = [];

    pickup.forEach((e) => {
      const x = {
        _id: {
          $ne: e.tps,
        },
      };
      neObj.push(x);
    });

    let tps;
    if (!neObj.length) {
      tps = await Tps.find();
    } else {
      tps = await Tps.find({
        $and: neObj,
      });
    }

    tps.forEach((e) => {
      pickup.push({
        tps: e._id,
        totalLoad: 0,
        price: 0,
        status: 'terverifikasi',
        payment_method: 'perbulan',
        payment_month: new Date(m.getFullYear(), m.getMonth()),
        payment_time: new Date(m.getFullYear(), m.getMonth()),
      });
    });

    const tagihan = await Tagihan.find({
      payment_month: new Date(m.getFullYear(), m.getMonth()),
    });

    pickup = pickup.filter((e) => {
      // console.log(tagihan);
      if (tagihan.filter((y) => `${y.tps._id}` === `${e.tps}`).length > 0) {
        return false;
      }
      return true;
    });
    console.log(pickup);

    pickup.forEach(async (e) => {
      await Tagihan.create(e);
    });
  } catch (err) {
    console.log(err);
  }
};
