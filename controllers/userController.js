const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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
exports.deleteUser = base.deleteOne(User);

exports.updateUser = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError('Hanya user sendiri yang bisa mengubah passwordnya', 400)
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, [
      'name',
      'email',
      'pns',
      'address',
      'NIP',
      'phone',
      'role',
    ]);
    if (req.file) filteredBody.photo = req.file.filename;

    console.log(filteredBody);
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
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
        user: updatedUser,
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    let user;
    if (!req.params.id) {
      user = req.body;
    } else {
      user = await User.findById(req.params.id);
      if (user.photo !== 'default-user-image.png') {
        fs.unlink(`public/img/users/${user.photo}`, (err) => {
          console.error(err);
        });
      }
      if (req.body.NIP) {
        user.NIP = req.body.NIP;
      }
    }

    if (!req.file) return next();
    req.file.filename = `user-${user.role}-${user.NIP}.jpeg`;
    // }-${Date.now()}.jpeg`;

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
