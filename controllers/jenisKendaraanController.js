const JenisKendaraan = require('../models/jenisKendaraanModel');
const base = require('./baseController');

exports.create = base.createOne(
  JenisKendaraan,
  'type',
  'empty_weight',
  'max_load_weight'
);
exports.getAll = base.getAll(JenisKendaraan);
exports.get = base.getOne(JenisKendaraan);
exports.update = base.updateOne(
  JenisKendaraan,
  'type',
  'empty_weight',
  'max_load_weight'
);
exports.delete = base.deleteOne(JenisKendaraan);
