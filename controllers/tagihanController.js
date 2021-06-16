const Tagihan = require('../models/tagihanModel');
const base = require('./baseController');

// exports.create = base.createOne(Tagihan, 'total', 'bukti', 'waktu', 'status');
exports.getAll = base.getAll(Tagihan);
exports.get = base.getOne(Tagihan);
exports.updateStatus = base.updateOne(Tagihan, 'status');
exports.delete = base.deleteOne(Tagihan);

exports.getMyTagihan = async (req, res, next) => {
  try {
    const tagihan = await Tagihan.find({ tps: req.user.tps });

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        results: tagihan.length,
        tagihan,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.pay = async (req, res, next) => {};
