const Checkout = require('../models/checkoutModel');

exports.createCheckout = async (req, res, next) => {
  try {
    const checkout = await Checkout.create({
      qr_id: 'test',
      petugas: req.body.petugas,
      bak: req.body.bak,
      kendaraan: req.body.kendaraan,
      tps: req.body.tps,
      waktu_ambil: Date.now(),
    });

    res.status(201).json({
      status: 'success',
      data: checkout,
    });
  } catch (err) {
    next(err);
  }
};
