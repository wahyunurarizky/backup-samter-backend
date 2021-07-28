const JenisKendaraan = require('../models/jenisKendaraanModel');
const Kendaraan = require('../models/kendaraanModel');
const base = require('./baseController');
const AppError = require('../utils/appError');

exports.create = base.createOne(
  JenisKendaraan,
  'type',
  'empty_weight',
  'max_load_weight'
);
exports.getAll = base.getAll(JenisKendaraan, [], ['type']);
exports.get = base.getOne(JenisKendaraan);
exports.update = base.updateOne(
  JenisKendaraan,
  'type',
  'empty_weight',
  'max_load_weight'
);
// exports.delete = base.deleteOne(JenisKendaraan);
exports.delete = async (req, res, next) => {
  try {
    const doc = await JenisKendaraan.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    const deletedKendaraans = await Kendaraan.updateMany(
      { kendaraan_type: doc._id },
      {
        isDeleted: true,
      }
    );
    console.log(deletedKendaraans);
    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
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
