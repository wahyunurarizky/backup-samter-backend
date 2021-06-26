const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Complaint = require('../models/complaintModel');
const base = require('./baseController');

exports.create = async (req, res, next) => {
  try {
    if (req.file) req.body.pict = req.file.filename;
    const complaint = await Complaint.create({
      pict: `${process.env.URL}img/complaint${req.body.pict}`,
      nik: req.body.nik,
      phone: req.body.phone,
      desc: req.body.desc,
      loc: req.body.loc,
    });
    res.status(201).json({
      success: true,
      code: '201',
      message: 'OK',
      data: {
        complaint,
      },
    });
  } catch (err) {
    next(err);
  }
};
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

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Bukan gambar!, mohon hanya upload file gambar', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadComplaintPhoto = upload.single('pict');

exports.resizeComplaintPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.file.filename = `complaint-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/complaint/${req.file.filename}`);

    next();
  } catch (err) {
    next(err);
  }
};
