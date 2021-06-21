const Bank = require('../models/bankModel');
const base = require('./baseController');

exports.create = base.createOne(Bank, 'number_account', 'name');
exports.getAll = base.getAll(Bank);
exports.get = base.getOne(Bank);
exports.update = base.updateOne(Bank, 'number_account', 'name');
exports.delete = base.deleteOne(Bank);
