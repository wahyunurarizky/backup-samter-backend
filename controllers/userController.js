const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });

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

exports.updateMe = async (req, res, next) => {
  // perlu kah?
};

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User, [{ path: 'tps' }, { path: 'tpa' }]);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);

exports.getPetugasByQrId = async (req, res, next) => {
  try {
    const petugas = await User.findOne({
      role: 'petugas',
      qr_id: req.params.qrid,
    });

    if (!petugas) {
      return next(
        new AppError('tidak ada petugas yang cocok dengan id tersebut', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'success get data',
      data: petugas,
    });
  } catch (error) {
    next(error);
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.role}-${
      req.user.NIP
    }-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
  } catch (err) {
    next(err);
  }
};
