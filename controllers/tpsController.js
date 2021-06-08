const Tps = require('../models/tpsModel');
const base = require('./baseController');

exports.create = base.createOne(
  Tps,
  'nama',
  'lokasi',
  'alamat',
  'kecamatan',
  'kelurahan',
  'kapasitas',
  'koordinator',
  'total_berat'
);
exports.getAll = base.getAll(Tps);
exports.get = base.getOne(Tps);
exports.update = base.updateOne(Tps);
exports.delete = base.deleteOne(Tps);
