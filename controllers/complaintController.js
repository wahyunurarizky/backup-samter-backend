const Complaint = require('../models/complaintModel');
const base = require('./baseController');

exports.create = base.createOne(
  Complaint,
  'nik',
  'phone',
  'pict',
  'desc',
  'loc'
);
exports.getAll = base.getAll(Complaint);
exports.get = base.getOne(Complaint);
exports.update = base.updateOne(
  Complaint,
  'nik',
  'phone',
  'pict',
  'desc',
  'loc',
  'status',
  'solution'
);
