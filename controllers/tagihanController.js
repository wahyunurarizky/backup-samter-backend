const multer = require('multer');
const sharp = require('sharp');
const pdf = require('html-pdf');
const ejs = require('ejs');
const midtransClient = require('midtrans-client');

const Tagihan = require('../models/tagihanModel');
const Pickup = require('../models/pickupModel');
const base = require('./baseController');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
// const bus = require('../utils/eventBus');

// exports.create = base.createOne(Tagihan, 'total', 'bukti', 'waktu', 'status');
exports.getAll = base.getAll(
  Tagihan,
  [
    { path: 'pickup', select: 'load' },
    { path: 'tps', select: 'name' },
  ],
  ['status', 'qr_id', 'pembayar', 'payment_method'],
  '-payment_time'
);
exports.get = base.getOne(Tagihan);
exports.updateStatus = base.updateOne(Tagihan, 'status', 'description');
exports.delete = base.deleteOne(Tagihan);

exports.getMyTagihan = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Tagihan.find({ tps: req.user.tps }),
      req.query
    )
      .filter()
      .sort('-payment_time')
      .limit()
      .paginate()
      .search(['status', 'qr_id', 'pembayar', 'payment_method']);

    const docs = await features.query.populate([
      { path: 'pickup', select: 'load' },
      { path: 'tps', select: 'name' },
    ]);

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        results: docs.length,
        tagihan: docs,
      },
    });
  } catch (error) {
    next(error);
  }
};
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

exports.uploadPaymentPhoto = upload.single('payment_photo');

exports.resizePaymentPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.file.filename = `bukti-${req.params.id}.jpeg`;

    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 60 })
      .toFile(`public/img/bukti/${req.file.filename}`);

    next();
  } catch (err) {
    next(err);
  }
};
exports.pay = async (req, res, next) => {
  const tagihan = await Tagihan.findById(req.params.id);
  if (!tagihan) {
    return new AppError('id tagihan tidak ada', 400);
  }

  if (tagihan.tps._id.toString() !== req.user.tps.toString()) {
    return next(
      new AppError('kamu tidak bisa membayar tagihan orang lain', 403)
    );
  }

  if (tagihan.status === 'terverifikasi') {
    return next(new AppError('sudah berhasil dibayar', 401));
  }

  if (req.file) req.body.payment_photo = req.file.filename;
  const payment = await Tagihan.findByIdAndUpdate(
    req.params.id,
    {
      payment_photo: `${process.env.URL}img/bukti/${req.body.payment_photo}`,
      status: 'belum terverifikasi',
      pembayar: req.user.name,
      payment_payed_time: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    code: '200',
    message: 'OK',
    data: {
      user: payment,
    },
  });
};

exports.createTagihanMonthly = async () => {
  try {
    const m = new Date(Date.now());
    const pickup = await Pickup.aggregate([
      {
        $match: {
          payment_method: 'perbulan',
          arrival_time: {
            $gte: new Date(m.getFullYear(), m.getMonth() - 1),
            $lt: new Date(m.getFullYear(), m.getMonth()),
          },
        },
      },
      {
        $group: {
          _id: '$tps',
          total_load: { $sum: '$load' },
        },
      },
      {
        $addFields: {
          tps: '$_id',
          status: 'belum terbayar',
          payment_method: 'perbulan',
          payment_month: new Date(m.getFullYear(), m.getMonth() - 1, 2),
          payment_time: new Date(m.getFullYear(), m.getMonth() - 1, 2),
          price: {
            // penting perlu dihiung berat truknya juga
            $multiply: ['$total_load', process.env.DEFAULT_PRICE_PER_KG * 1],
          },
        },
      },
      // menghapus atau tidak menampilkan id
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    console.log(pickup);

    const pckp = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const p of pickup) {
      // eslint-disable-next-line no-await-in-loop
      const tagihan = await Tagihan.findOne({
        tps: p.tps,
        payment_month: p.payment_month,
      });
      if (!tagihan) {
        pckp.push(p);
      }
    }

    console.log(pckp);

    await Tagihan.create(pckp);
  } catch (err) {
    console.log(err);
  }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const date = new Date(Date.now());
    const features = new APIFeatures(Tagihan.find(), req.query)
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
    const fileName = `tagihan-${yea}${mon}${day}${hou}${min}${sec}${mil}.pdf`;
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
    if (req.query.payment_time) {
      if (req.query.payment_time.gte) {
        timeTemp.gte = req.query.payment_time.gte;
        timeTemp.gte = new Date(timeTemp.gte).toLocaleString('id-ID', {
          timeZone: 'Asia/jakarta',
          month: 'long',
          year: 'numeric',
        });
        timeTemp.gteReq = true;
      }
      console.log(timeTemp.gte);

      if (req.query.payment_time.lte) {
        timeTemp.lte = req.query.payment_time.lte;
        timeTemp.lte = new Date(timeTemp.lte).toLocaleString('id-ID', {
          timeZone: 'Asia/jakarta',
          month: 'long',
          year: 'numeric',
        });
        timeTemp.lteReq = true;
      }
      console.log(timeTemp.lte);
    }

    if (req.query.payment_time) {
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
      month: 'long',
      year: 'numeric',
    });
    console.log(dateTemp);

    if (req.query.payment_method) {
      if (req.query.payment_method === 'perbulan') {
        timeTemp.paymentMethod = 'Bulanan';
        timeTemp.paymentMethodReq = true;
      } else if (req.query.payment_method === 'perangkut') {
        timeTemp.paymentMethod = 'Angkutan';
        timeTemp.paymentMethodReq = true;
      }
    }

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
            <% if (${timeTemp.paymentMethodReq}) { %>
              <h1 style="text-align: center">Laporan Retribusi Sampah (${timeTemp.paymentMethod})</h1>
            <% } else { %>
              <h1 style="text-align: center">Laporan Retribusi Sampah</h1>
            <% } %>

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
                <th style="border: 3px solid black">Nama Pembayar</th>
                <th style="border: 3px solid black">TPS</th>
                <th style="border: 3px solid black">Keterangan Waktu</th>
                <th style="border: 3px solid black">Jumlah</th>
                <th style="border: 3px solid black">Berat Akumulasi (Kg)</th>
              </tr>
              <% for(let i=0; i<datas.length; i++) {%>
                <tr>
                  <td style="border: 3px solid black">
                    <%= i+1 %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].pembayar != null) { %>
                      <%= datas[i].pembayar %>
                    <% } %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].tps != null) { %>
                      <%= datas[i].tps.name %>
                    <% } %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].payment_time) %>
                      <%= datas[i].payment_time.toLocaleString('id-ID', {timeZone: 'Asia/jakarta',month: 'long',year: 'numeric',}) %>
                  </td>
                  <td style="border: 3px solid black">
                    <%= datas[i].price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) %>
                  </td>
                  <td style="border: 3px solid black">
                    <% if (datas[i].total_load != null) { %>
                      <%= datas[i].total_load %>
                    <% } %>
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

exports.getTransactionToken = async (req, res, next) => {
  try {
    // 1) Get the currently booked tour
    const tagihan = await Tagihan.findById(req.params.tagihanId);
    // console.log(tour);
    if (!tagihan) {
      return next(new AppError('tidak ada tagihan dengan id tersebut', 404));
    }

    const snap = new midtransClient.Snap({
      // Set to true if you want Production Environment (accept real transaction).
      isProduction: false,
      serverKey: 'SB-Mid-server-kyQCjeU8EZJQYb_NDoLmt19q',
    });

    const parameter = {
      transaction_details: {
        order_id: tagihan._id,
        gross_amount: tagihan.price,
      },
      item_details: [
        {
          id: tagihan.qr_id,
          price: tagihan.price,
          quantity: 1,
          name: tagihan.qr_id,
        },
      ],
      customer_details: {
        first_name: tagihan.tps.name,
        last_name: '',
        email: req.user.email,
        phone: req.user.phone,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    console.log(transaction);

    return res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        ...transaction,
        // tagihan,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.notificationCheckout = async (req, res, next) => {
  try {
    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: 'SB-Mid-server-kyQCjeU8EZJQYb_NDoLmt19q',
      clientKey: 'SB-Mid-client-TnDd7DdTmVrqeia4',
    });

    const statusResponse = await apiClient.transaction.notification(req.body);
    console.log('statusRespones', statusResponse);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const tagihan = await Tagihan.findById(orderId);

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    // Sample transactionStatus handling logic

    if (transactionStatus === 'capture') {
      // capture only applies to card transaction, which you need to check for the fraudStatus
      if (fraudStatus === 'challenge') {
        // TODO set transaction status on your databaase to 'challenge'
      } else if (fraudStatus === 'accept') {
        tagihan.status = 'terverifikasi';
        await tagihan.save();
        // TODO set transaction status on your databaase to 'success'
      }
    } else if (transactionStatus === 'settlement') {
      // TODO set transaction status on your databaase to 'success'
    } else if (transactionStatus === 'deny') {
      // TODO you can ignore 'deny', because most of the time it allows payment retries
      // and later can become success
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'expire'
    ) {
      // TODO set transaction status on your databaase to 'failure'
    } else if (transactionStatus === 'pending') {
      // TODO set transaction status on your databaase to 'pending' / waiting payment
    }
    // .then((statusResponse) => {
    //   const orderId = statusResponse.order_id;
    //   const transactionStatus = statusResponse.transaction_status;
    //   const fraudStatus = statusResponse.fraud_status;

    //   console.log(
    //     `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    //   );

    //   // Sample transactionStatus handling logic

    //   if (transactionStatus === 'capture') {
    //     // capture only applies to card transaction, which you need to check for the fraudStatus
    //     if (fraudStatus === 'challenge') {
    //       // TODO set transaction status on your databaase to 'challenge'
    //     } else if (fraudStatus === 'accept') {
    //       // TODO set transaction status on your databaase to 'success'
    //     }
    //   } else if (transactionStatus === 'settlement') {
    //     // TODO set transaction status on your databaase to 'success'
    //   } else if (transactionStatus === 'deny') {
    //     // TODO you can ignore 'deny', because most of the time it allows payment retries
    //     // and later can become success
    //   } else if (
    //     transactionStatus === 'cancel' ||
    //     transactionStatus === 'expire'
    //   ) {
    //     // TODO set transaction status on your databaase to 'failure'
    //   } else if (transactionStatus === 'pending') {
    //     // TODO set transaction status on your databaase to 'pending' / waiting payment
    //   }
    // });
    res.status(200).json({
      test: 'asdasd',
    });
  } catch (err) {
    next(err);
  }
};
