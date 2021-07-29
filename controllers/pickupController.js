const QRCode = require('qrcode');
// const moment = require('moment-timezone');
const pdf = require('html-pdf');
const ejs = require('ejs');
const nodeHtmlToImage = require('node-html-to-image');

const Pickup = require('../models/pickupModel');
const Tps = require('../models/tpsModel');
const Bak = require('../models/bakModel');
const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const base = require('./baseController');
const Tagihan = require('../models/tagihanModel');
const APIFeatures = require('../utils/apiFeatures');

exports.createPickup = async (req, res, next) => {
  try {
    if (!req.user.allowedPick)
      return next(
        new AppError(
          'tidak bisa pick up, selesaikan dulu pick up anda sebelumnya',
          400
        )
      );

    console.log(req.body.kendaraan);
    const kendaraan = await Kendaraan.findOne({ qr_id: req.body.kendaraan });

    if (!kendaraan)
      return next(
        new AppError(
          'Kendaraan Tidak Ditemukan, harap masukan ID yg benar',
          404
        )
      );

    const tps = await Tps.findOne({ qr_id: req.body.tps });
    if (!tps)
      return next(
        new AppError('TPS Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const bak = await Bak.findOne({ qr_id: req.body.bak });
    if (!bak)
      return next(
        new AppError('BAK Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    let petugas = req.user._id;
    if (req.user.role === 'operator tpa') {
      const petugas_temp = await User.findOne({ NIP: req.body.NIP_petugas });
      if (!petugas_temp)
        return next(
          new AppError(
            'petugas Tidak Ditemukan, harap masukan NIP yg benar',
            404
          )
        );
      petugas = petugas_temp._id;
    }

    const pickup = await Pickup.create({
      // qr_id,
      petugas,
      bak: bak._id,
      kendaraan: kendaraan._id,
      tps: tps._id,
      pickup_time: Date.now(),
      arrival_time: null,
      payment_method: tps.payment_method,
    });

    if (req.user.role === 'operator tpa') {
      req.pickup = pickup;
      return next();
    }

    await User.findByIdAndUpdate(req.user._id, { allowedPick: false });
    // await Tagihan.create({});

    const stringdata = JSON.stringify(pickup.qr_id);

    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const qrdata = {
        imgUrl: imgUrl,
      };
      if (err) return next(new AppError('Error Occured', 400));
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          pickup: {
            _id: pickup._id,
            qr_id: pickup.qr_id,
          },
          qrdata,
        },
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyPickup = async (req, res, next) => {
  if (req.user.role === 'petugas') {
    req.filter = { petugas: req.user._id };
  } else if (req.user.role === 'koordinator ksm') {
    req.filter = { tps: req.user.tps };
  }

  try {
    const features = new APIFeatures(Pickup.find(req.filter), req.query)
      .filter()
      .sort('-pickup_time')
      .limit()
      .paginate()
      .search(['qr_id', 'status']);

    const docs = await features.query.populate();

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        results: docs.length,
        pickup: docs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = base.getAll(Pickup, [], ['qr_id', 'status'], '-pickup_time');
exports.get = base.getOne(Pickup);
exports.updateStatus = async (req, res, next) => {
  try {
    if (req.body.status === 'selesai' && req.user.role !== 'operator tpa') {
      return next(new AppError('tidak diizinkan merubah menjadi selesai', 403));
    }
    const pickup = await Pickup.findById(req.params.id);
    if (pickup.status === 'berhasil') {
      return next(new AppError('status tidak bisa diubah', 403));
    }

    // const filteredBody = filterObj(req.body, fields);
    const updatedDoc = await Pickup.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, desc: req.body.desc },
      {
        // jangan lupa run validators pada update
        new: true,
        runValidators: true,
      }
    );
    if (!updatedDoc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    if (updatedDoc.status === 'tidak selesai') {
      await User.findByIdAndUpdate(updatedDoc.petugas._id, {
        allowedPick: true,
      });
    } else {
      await User.findByIdAndUpdate(updatedDoc.petugas._id, {
        allowedPick: false,
      });
    }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        doc: updatedDoc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getByQr = async (req, res, next) => {
  try {
    const pickup = await Pickup.findOne({ qr_id: req.params.qr_id });

    if (!pickup) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan id tersebut', 404)
      );
    }
    // if (pickup.pickup_time) {
    //   console.log(new Date(pickup.pickup_time));
    // }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.inputLoad = async (req, res, next) => {
  try {
    let checkPickup;
    if (!req.params.id) {
      checkPickup = req.pickup;
      req.params.id = checkPickup._id;
    } else {
      checkPickup = await Pickup.findById(req.params.id);
    }

    if (checkPickup.status === 'selesai')
      return next(new AppError('id pickup telah selesai digunakan', 400));

    const updatedPickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      {
        load: req.body.load,
        status: 'selesai',
        arrival_time: Date.now(),
        operator_tpa: req.user._id,
        tpa: req.user.tpa,
      },
      { new: true, runValidators: true }
    );
    if (!updatedPickup) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    await User.findByIdAndUpdate(updatedPickup.petugas, {
      allowedPick: true,
    });

    if (checkPickup.payment_method === 'perangkut') {
      await Tagihan.create({
        pickup: checkPickup._id,
        status: 'belum terbayar',
        payment_method: 'perangkut',
        payment_time: updatedPickup.arrival_time,
        price: updatedPickup.load * process.env.DEFAULT_PRICE_PER_KG,
        tps: checkPickup.tps,
      });
    }

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup: updatedPickup,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.generateQr = async (req, res, next) => {
  try {
    if (req.user.allowedPick) {
      return next(new AppError('tidak ada data', 404));
    }
    const doc = await Pickup.findOne({
      petugas: req.user._id,
      status: 'menuju tpa',
    });

    if (!doc) {
      return next(new AppError('tidak ada data', 404));
    }

    const stringdata = JSON.stringify(doc.qr_id);

    QRCode.toDataURL(stringdata, (err, imgUrl) => {
      const pickup = {
        pickup_id: doc._id,
        qr_id_bak: doc.bak.qr_id,
        qr_id_kendaraan: doc.kendaraan.qr_id,
        qr_id_tps: doc.tps.qr_id,
        qr_id_pickup: doc.qr_id,
        imgUrl: imgUrl,
      };
      if (err) return next(new AppError('Error Occured', 400));
      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          pickup,
        },
      });
    });
  } catch (err) {
    next(err);
  }
};
exports.isAlreadyDone = async (req, res, next) => {
  try {
    if (!req.user.allowedPick)
      return next(
        new AppError(
          'belum selesai, segera timbang dan lapor operator tpa',
          403
        )
      );
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return next(new AppError('id salah', 400));
    }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        pickup,
      },
    });
    console.log('itu diatas');
  } catch (err) {
    next(err);
  }
};

exports.getAverage = async (req, res, next) => {
  try {
    let m;
    if (req.params.month || req.params.year) {
      m = new Date(req.params.year * 1 - 1, req.params.month * 1 - 1);
    } else {
      m = new Date(Date.now());
    }

    let objMatch = {};
    if (req.user.role === 'koordinator ksm') {
      objMatch = {
        tps: req.user.tps,
        arrival_time: {
          $gte: new Date(m.getFullYear(), m.getMonth()),
          $lt: new Date(m.getFullYear() + 1, m.getMonth() + 1),
        },
      };
    } else {
      objMatch = {
        arrival_time: {
          $gte: new Date(m.getFullYear(), m.getMonth()),
          $lt: new Date(m.getFullYear() + 1, m.getMonth() + 1),
        },
      };
    }

    const pickupEachWeek = await Pickup.aggregate([
      {
        $match: objMatch,
      },
      {
        $group: {
          _id: { $week: '$arrival_time' },
          total: { $sum: '$load' },
        },
      },
    ]);
    let sum = 0;
    pickupEachWeek.forEach((num) => {
      sum += num.total;
    });
    console.log(pickupEachWeek);
    const avgLoadWeek = sum / pickupEachWeek.length;

    const pickupThisMonth = await Pickup.aggregate([
      {
        $match: objMatch,
      },
      {
        $group: {
          _id: { $month: '$arrival_time' },
          total: { $sum: '$load' },
        },
      },
    ]);
    console.log(pickupThisMonth);
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        avgLoadWeek,
        totalLoad: pickupThisMonth[0] ? pickupThisMonth[0].total : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAverageWeekly = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      code: '200',
      message: 'ini dummy',
      data: {
        week1: 3000,
        week2: 4000,
        week3: 6500,
        week4: 2100,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getLastDays = base.getAll(Pickup);

exports.createPickupByTPA = async (req, res, next) => {
  try {
    const kendaraan = await Kendaraan.findOne({ qr_id: req.body.kendaraan });
    if (!kendaraan)
      return next(
        new AppError(
          'Kendaraan Tidak Ditemukan, harap masukan ID yg benar',
          404
        )
      );

    const tps = await Tps.findOne({ qr_id: req.body.tps });
    if (!tps)
      return next(
        new AppError('TPS Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const bak = await Bak.findOne({ qr_id: req.body.bak });
    if (!bak)
      return next(
        new AppError('BAK Tidak Ditemukan, harap masukan ID yg benar', 404)
      );

    const petugas = await User.findOne({ NIP: req.body.NIP_petugas });
    if (!petugas)
      return next(
        new AppError('petugas Tidak Ditemukan, harap masukan NIP yg benar', 404)
      );

    const pickup = await Pickup.create({
      // qr_id,
      petugas: petugas._id,
      bak: bak._id,
      kendaraan: kendaraan._id,
      tps: tps._id,
      pickup_time: Date.now(),
      arrival_time: Date.now(),
      payment_method: tps.payment_method,
    });

    req.pickup = pickup;
    next();

    // await User.findByIdAndUpdate(req.user._id, { allowedPick: false });
    // await Tagihan.create({});
  } catch (err) {
    next(err);
  }
};

exports.download = async (req, res, next) => {
  const query = Pickup.findById(req.params.id);
  query.populate();
  const doc = await query.select('-__v');

  // console.log(doc);
  if (!doc) {
    return next(
      new AppError('tidak ada dokumen yang ditemukan dengan id tersebut', 404)
    );
  }

  let pickup_time_local_temp = '';
  pickup_time_local_temp = doc.pickup_time.toLocaleString('id-ID', {
    timeZone: 'Asia/jakarta',
  });
  pickup_time_local_temp = pickup_time_local_temp.slice(9, 17);
  pickup_time_local_temp = pickup_time_local_temp.replace('.', ':');
  pickup_time_local_temp = pickup_time_local_temp.replace('.', ':');

  let arrival_time_local_temp = '';
  arrival_time_local_temp = doc.arrival_time.toLocaleString('id-ID', {
    timeZone: 'Asia/jakarta',
  });
  arrival_time_local_temp = arrival_time_local_temp.slice(9, 17);
  arrival_time_local_temp = arrival_time_local_temp.replace('.', ':');
  arrival_time_local_temp = arrival_time_local_temp.replace('.', ':');

  const image = await nodeHtmlToImage({
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Karla:wght@300&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://kit.fontawesome.com/d32f06ea3a.js"
          crossorigin="anonymous"
        ></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'karla', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e5e5e5;
          }
          .container {
            width: 300px;
            background-color: white;
            min-height: 70vh;
          }
          .label-r {
            margin-top: 5px;
            text-align: center;
          }
          .img-label {
            display: flex;
            align-items: center;
          }
          .img-label .text {
            margin-top: 30px;
            margin-left: 20px;
            font-size: 14px;
          }
          .img-label img {
            margin-top: 30px;
            margin-left: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: solid #e5e5e5;
          }

          .isi {
            padding-top: 20px;
            display: flex;
            padding-left: 30px;
          }
          .isi i {
            color: green;
            padding-right: 5px;
            padding-top: 3px;
          }
          .card {
            display: flex;
            flex-wrap: wrap;
            flex-direction: column;
            justify-content: space-around;
            margin-bottom: 20px;
          }
          .text {
            text-transform: uppercase;
          }
        </style>
        <title>Document</title>
      </head>
      <body>
        <div class="container">
          <h3 class="label-r">Riwayat</h3>

          <div class="img-label">
            <img src="/img.png" alt="" />
            <div class="text">
              <p>nama: ${doc.petugas.name}</p>
              <p>id: ${doc.petugas.NIP}</p>
              <p>id pickup: ${doc.qr_id}</p>
            </div>
          </div>
          <div class="card">
            <div class="isi">
              <i class="fas fa-shopping-basket"></i>
              <div class="text">
                <p>TPS</p>
                <p>ID : ${doc.tps.qr_id}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-clock"></i>
              <div class="text">
                <p>Lokasi TPS</p>
                <p>${doc.tps.location.city}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-map-pin"></i>
              <div class="text">
                <p>No. Kendaraan</p>
                <p>${doc.kendaraan.plat}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-clock"></i>
              <div class="text">
                <p>Bak Sampah</p>
                <p>ID : ${doc.bak.qr_id}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-truck-moving"></i>
              <div class="text">
                <p>Waktu Pengangkutan</p>
                <p>${pickup_time_local_temp}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-balance-scale"></i>
              <div class="text">
                <p>Waktu Bongkar Muat</p>
                <p>${arrival_time_local_temp}</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-shopping-basket"></i>
              <div class="text">
                <p>Muatan Bongkar Muat</p>
                <p>${doc.load} kg</p>
              </div>
            </div>
            <div class="isi">
              <i class="fas fa-balance-scale"></i>
              <div class="text">
                <p>Muatan MAX</p>
                <p>${doc.kendaraan.kendaraan_type.max_load_weight} kg</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>`,
  });
  const base64Image = new Buffer.from(image).toString('base64');
  const dataURI = `data:image/jpeg;base64,${base64Image}`;

  res.status(200).json({
    success: true,
    code: '200',
    message: 'OK',
    data: {
      id: req.params.id,
      image: dataURI,
    },
  });
};

exports.exportPdf = async (req, res, next) => {
  try {
    const date = new Date(Date.now());
    const features = new APIFeatures(Pickup.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate()
      .search();

    const datas = await features.query.populate();

    const mil = date.getMilliseconds();
    const sec = date.getSeconds();
    const min = date.getMinutes();
    const hou = date.getHours();
    const day = date.getDay();
    const mon = date.getMonth();
    const yea = date.getFullYear();
    const fileName = `pickup-${yea}${mon}${day}${hou}${min}${sec}${mil}.pdf`;
    const tanggal = date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const waktu = `${hou}:${min}:${sec}`;

    let dirLogo = '\\public\\img\\logo\\Logo.png';
    dirLogo = process.cwd() + dirLogo;

    // const logoSrc = 'file:///projects/sampah-project/public/img/logo/Logo.png';
    if (req.query.tps) {
      req.query.tps = true;
    }

    const timeTemp = {};

    if (req.query.pickup_time.gte) {
      timeTemp.gte = req.query.pickup_time.gte;
      timeTemp.gte = new Date(timeTemp.gte).toLocaleString('id-ID', {
        timeZone: 'Asia/jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      timeTemp.gteReq = true;
    }
    console.log(timeTemp.gte);

    if (req.query.pickup_time.lte) {
      timeTemp.lte = req.query.pickup_time.lte;
      timeTemp.lte = new Date(timeTemp.lte).toLocaleString('id-ID', {
        timeZone: 'Asia/jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      timeTemp.lteReq = true;
    }
    console.log(timeTemp.lte);

    if (req.query.pickup_time) {
      timeTemp.thisMonth = date.toLocaleString('id-ID', {
        timeZone: 'Asia/jakarta',
        month: 'long',
        year: 'numeric',
      });
      timeTemp.thisMonthReq = true;
    }
    console.log(timeTemp.thisMonth);

    const dateTemp = date.toLocaleString('id-ID', {
      timeZone: 'Asia/jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    console.log(dateTemp);

    const html = ejs.render(
      `<!DOCTYPE html>
      <html>
        <head>
          <mate charest="utf-8" />
          <title>Laporan Pengaduan</title>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
            crossorigin="anonymous"
          />
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
            crossorigin="anonymous"
          ></script>
        </head>
      
        <body>
          <div class="container">
            <h1 style="text-align: center">Laporan Pengangkutan Sampah</h1>

            <% if (${req.query.tps}) { %>
              <% if (datas[0].tps != null) { %>
                <h3 style="text-align: center"><%= datas[0].tps.name %></h3>
              <% } %>
            <% } %>

            <% if (${timeTemp.gteReq} && ${timeTemp.lteReq}) { %>
              <h3 style="text-align: center">${timeTemp.gte} - ${timeTemp.lte}</h3>
            <% } else if (${timeTemp.gteReq}) { %>
              <h3 style="text-align: center">${timeTemp.gte} -  ${dateTemp}</h3>
            <% } else if (${timeTemp.thisMonthReq}) { %>
              <h3 style="text-align: center">${timeTemp.thisMonth}</h3>
            <% } %>
            <br>
            <table>
              <tr>
                <td>Tanggal</td>
                <td>: ${tanggal}</td>
              </tr>
              <tr>
                <td>Waktu</td>
                <td>: ${waktu}</td>
              </tr>
            </table>
            <table class="table table-bordered" style="border: 3px solid black; text-align: center;">
              <tr>
                <th style="border: 3px solid black">No</th>
                <th style="border: 3px solid black">Nama Petugas</th>
                <th style="border: 3px solid black">TPS</th>
                <th style="border: 3px solid black">No Polisi</th>
                <th style="border: 3px solid black">ID Bak Sampah</th>
                <th style="border: 3px solid black">Waktu Muat</th>
                <th style="border: 3px solid black">Waktu Bongkar</th>
                <th style="border: 3px solid black">Nama Operator</th>
                <th style="border: 3px solid black">Muatan (Kg)</th>
              </tr>
              <% for(let i=0; i<datas.length; i++) {%>
                <tr>
                  <td style="border: 3px solid black">
                    <%= i+1 %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].petugas.name %> <br>
                    <%= datas[i].petugas.NIP %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].tps.name %> <br>
                    <%= datas[i].tps.qr_id %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].kendaraan.plat %> <br>
                    <%= datas[i].kendaraan.kendaraan_type.type %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].bak.qr_id %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].pickup_time) %>
                      <%= datas[i].pickup_time.toLocaleString('id-ID', {timeZone: 'Asia/jakarta',hour12: false,}) %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].arrival_time != null) { %>
                      <%= datas[i].arrival_time.toLocaleString('id-ID', {timeZone: 'Asia/jakarta',hour12: false,}) %>
                    <% } %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].operator_tpa != null) { %>
                      <%= datas[i].operator_tpa.name %> <br>
                      <%= datas[i].operator_tpa.NIP %>
                    <% } %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].load %>
                  </td>
                </tr>
              <% } %>
            </table>
          </div>
        </body>
      </html>
      `,
      {
        datas: datas,
      }
    );

    const options = {
      format: 'A4',
      orientation: 'landscape',
      border: '10mm',
      footer: {
        height: '10mm',
        contents: {
          default:
            '<span style="color: #444; text-align: right">Page {{page}}</span> of <span>{{pages}}</span>',
          last: `<table>
          <tr>
            <td><img src=${dirLogo} alt="Logo-Samter"></td>
            <td><strong>SAMTER SALATIGA</strong> <br> Versi 1.0</td>
          </tr>
        </table>`,
        },
      },
    };

    pdf.create(html, options).toStream(async (err, stream) => {
      if (err) {
        //error handling
        console.log(err);
      }
      res.writeHead(200, {
        'Content-Type': 'application/force-download',
        'Content-disposition': `attachment; filename=${fileName}`,
      });
      stream.pipe(res);
    });
  } catch (err) {
    return next(err);
  }
};
