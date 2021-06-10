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
      status: 'success',
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
