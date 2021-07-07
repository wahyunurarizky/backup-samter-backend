const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

// function bantuan untuk filter object
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// get me dan delete me
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isDeleted: false,
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

// restrict to pegawai dan superadmin
exports.getAllUsers = base.getAll(User, [
  { path: 'tps', select: 'name' },
  { path: 'tpa', select: 'name' },
]);
exports.getUser = base.getOne(User, [
  { path: 'tps', select: '-__v' },
  { path: 'tpa', select: '-__v' },
]);

exports.createUser = async (req, res, next) => {
  try {
    const filteredBody = filterObj(req.body, [
      'name',
      'email',
      'password',
      'passwordConfirm',
      'passwordChangedAt',
      'role',
      'address',
      'NIP',
      'phone',
      'photo',
      'tpa',
      'tps',
      'jumlah_penarikan',
      'jabatan',
      'golongan',
      'work_unit',
    ]);

    if (req.file)
      // filteredBody.photo = `${req.protocol}://${req.get('host')}/img/users/${
      //   req.file.filename
      // }`;
      filteredBody.photo = `${process.env.URL}img/users/${req.file.filename}`;

    const newUser = await User.create(filteredBody);

    newUser.password = undefined;

    res.status(201).json({
      success: true,
      code: '201',
      message: 'OK',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Don't update password on this
exports.deleteUser = base.deleteOne(User);

exports.updateUser = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('Bukan tempat untuk update password', 400));
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
    if (req.file)
      filteredBody.photo = `${process.env.URL}img/users/${req.file.filename}`;

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

exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        user,
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
    // ini untuk create
    if (!req.params.id) {
      user = req.body;
    }
    // ini untuk update
    else {
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
    req.file.filename = `user-${user.role}-${user.NIP}.jpeg`.replace(/\s/g, '');
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
