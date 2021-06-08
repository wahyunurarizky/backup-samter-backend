const JenisKendaraan = require('../models/jenisKendaraanModel');
const base = require('./baseController');

exports.create = base.createOne(
  JenisKendaraan,
  'jenis',
  'berat_kosong',
  'berat_muatan_maksimal'
);
exports.getAll = base.getAll(JenisKendaraan);
exports.get = base.getOne(JenisKendaraan);
exports.update = base.updateOne(JenisKendaraan);
exports.delete = base.deleteOne(JenisKendaraan);
