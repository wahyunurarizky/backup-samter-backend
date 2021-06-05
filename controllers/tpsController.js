const Tps = require('../models/tpsModel');
const base = require('./baseController');

exports.createOne = base.createOne(Tps);
exports.getAll = base.getAll(Tps);
exports.getOne = base.getOne(Tps);
exports.updateOne = base.updateOne(Tps);
exports.deleteOne = base.deleteOne(Tps);
