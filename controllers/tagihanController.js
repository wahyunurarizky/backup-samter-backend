const Tagihan = require('../models/tagihanModel');
const base = require('./baseController');

exports.create = base.createOne(Tagihan, 'total', 'bukti', 'waktu', 'status');
exports.getAll = base.getAll(Tagihan);
exports.get = base.getOne(Tagihan);
exports.update = base.updateOne(Tagihan);
exports.delete = base.deleteOne(Tagihan);
