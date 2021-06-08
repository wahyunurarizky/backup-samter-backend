const Kendaraan = require('../models/kendaraanModel');
const base = require('./baseController');

exports.create = base.createOne(
  Kendaraan,
  'plat_nomor',
  'unit_kerja',
  'tahun',
  'jenis_kendaraan_id'
);
exports.getAll = base.getAll(Kendaraan);
exports.get = base.getOne(Kendaraan);
exports.update = base.updateOne(Kendaraan);
exports.delete = base.deleteOne(Kendaraan);
