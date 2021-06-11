const moment = require('moment');
const numeral = require('numeral');
const Checkout = require('../models/checkoutModel');

exports.createCheckout = async (req, res, next) => {
  try {
    const date = this._id;
    const str = date.toString().toUpperCase();

    const qr_id = `CHCKT${str.substr(str.length - 6)}`;

    const checkout = await Checkout.create({
      qr_id,
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
