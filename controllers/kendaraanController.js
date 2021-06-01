const Kendaraan = require('../models/kendaraanModel');
const base = require('./baseController');

exports.getAllKendaraan = base.getAll(Kendaraan);
exports.getKendaraan = base.getOne(Kendaraan);
exports.createKendaraan = base.createOne(Kendaraan);