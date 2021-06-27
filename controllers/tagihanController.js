const multer = require('multer');
const sharp = require('sharp');
const Tagihan = require('../models/tagihanModel');
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

    req.file.filename = `bukti-${req.user.id}-${Date.now()}.jpeg`;

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
  if (tagihan.status === 'sudah dibayar') {
    return next(new AppError('sudah berhasil dibayar', 401));
  }

  if (req.file) req.body.payment_photo = req.file.filename;
  const payment = await Tagihan.findByIdAndUpdate(
    req.params.id,
    {
      payment_photo: `${process.env.URL}img/bukti/${req.body.payment_photo}`,
      status: 'menunggu konfirmasi',
      description: req.body.description,
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
