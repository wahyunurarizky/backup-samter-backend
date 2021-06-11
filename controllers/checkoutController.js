const moment = require('moment');
const numeral = require('numeral');
const Checkout = require('../models/checkoutModel');

exports.createCheckout = async (req, res, next) => {
  try {
    const date = new Date(Date.now());
    const detik = `${
      (date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()
    }`;

    const formatted = moment(date).format('DDMM');
    // const bln = date.getMonth() + 1;
    // console.log(date);

    console.log(`${formatted}${numeral(detik).format('00000')}`);
    // console.log(bln);

    // const qr_id = `CHCKT${date.substr(date.length - 6)}`;

    const checkout = await Checkout.create({
      // qr_id,
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
