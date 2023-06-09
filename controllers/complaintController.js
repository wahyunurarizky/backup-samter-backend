const multer = require('multer');
const sharp = require('sharp');

//Required package
const pdf = require('html-pdf');
const ejs = require('ejs');

const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Complaint = require('../models/complaintModel');
const { uploadFile } = require('../utils/s3UploadClient');
const base = require('./baseController');

// Read HTML Templat

exports.create = async (req, res, next) => {
  try {
    console.log('wkwk');
    // ini kalo mau ngakalin timezone jakarta
    // const wib_time = moment
    //   .tz('Asia/Calcutta')
    //   .startOf('hours')
    //   .tz('UTC')
    //   .subtract(-420, 'minutes');
    const time = new Date(Date.now());

    if (req.file) req.body.pict = req.file.filename;
    const complaint = await Complaint.create({
      pict: `${process.env.URL}img/complaint/${req.body.pict}`,
      time: time,
      name: req.body.name,
      nik: req.body.nik,
      address: req.body.address,
      kelurahan: req.body.kelurahan,
      kecamatan: req.body.kecamatan,
      phone: req.body.phone,
      desc: req.body.desc,
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
exports.notArchived = (req, res, next) => {
  if (!req.query.isArchived) {
    req.query.isArchived = { ne: true };
  }
  next();
};

exports.getAll = base.getAll(
  Complaint,
  [],
  ['name', 'kecamatan', 'kelurahan', 'nik', 'address'],
  '-time'
);
exports.get = base.getOne(Complaint);
// exports.update = base.updateOne(Complaint, 'status', 'solution', 'endTime');

exports.update = async (req, res, next) => {
  try {
    // const filteredBody = filterObj(req.body, fields);
    const updatedDoc = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        solution: req.body.solution,
        endTime: Date.now(),
      },
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

exports.updateUnArchived = async (req, res, next) => {
  try {
    // const filteredBody = filterObj(req.body, fields);
    const updatedDoc = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        isArchived: false,
      },
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

    console.log(req.file);

    req.file.filename = `complaint-${Date.now()}.jpeg`;

    const img = await sharp(req.file.buffer).jpeg({ quality: 90 }).toBuffer();

    const result = await uploadFile(img, `complaint/${req.file.filename}`);
    console.log(result);
    next();
  } catch (err) {
    next(err);
  }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const date = new Date(Date.now());
    // date.setDate(date.getDate() + 1);
    // req.query.time[lte] = date.toLocaleString();
    // console.log(date, req.query.time);

    const features = new APIFeatures(Complaint.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate()
      .search();

    const datas = await features.query;

    const mil = date.getMilliseconds();
    const sec = date.getSeconds();
    const min = date.getMinutes();
    const hou = date.getHours();
    const day = date.getDay();
    const mon = date.getMonth();
    const yea = date.getFullYear();
    const fileName = `cmplnt-${yea}${mon}${day}${hou}${min}${sec}${mil}.pdf`;
    const tanggal = date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const waktu = `${hou}:${min}:${sec}`;

    let dirLogo = '\\public\\img\\logo\\Logo.png';
    dirLogo = process.cwd() + dirLogo;

    // const logoSrc = 'file:///projects/sampah-project/public/img/logo/Logo.png';

    const timeTemp = {};

    if (req.query.time.gte) {
      timeTemp.gte = req.query.time.gte;
      timeTemp.gte = new Date(timeTemp.gte).toLocaleString('id-ID', {
        timeZone: 'Asia/jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      timeTemp.gteReq = true;
    }
    console.log(timeTemp.gte);

    if (req.query.time.lte) {
      timeTemp.lte = req.query.time.lte;
      timeTemp.lte = new Date(timeTemp.lte).toLocaleString('id-ID', {
        timeZone: 'Asia/jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      timeTemp.lteReq = true;
    }
    console.log(timeTemp.lte);

    if (req.query.time) {
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
        <h1 style="text-align: center">Laporan Pengaduan Sampah</h1>
        <% if (${timeTemp.gteReq} && ${timeTemp.lteReq}) { %>
          <h3 style="text-align: center">${timeTemp.gte} - ${timeTemp.lte}</h3>
        <% } else if (${timeTemp.gteReq}) { %>
          <h3 style="text-align: center">${timeTemp.gte} -  ${dateTemp}</h3>
        <% } else if (${timeTemp.thisMonthReq}) { %>
          <h3 style="text-align: center">${timeTemp.thisMonth}</h3>
        <% } %>
        <br>
        <div class="container">
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
          <table class="table table-bordered" style="border: 3px solid black">
            <tr>
              <th style="border: 3px solid black">Foto</th>
              <th style="width: 30%; border: 3px solid black"></th>
              <th style="width: 40%; border: 3px solid black"></th>
            </tr>
            <% for(let i=0; i<datas.length; i++) {%>
              <tr>
                <td style="border: 3px solid black" rowspan=12><img style="max-width: 300px;" src='<%= datas[i].pict %>' alt="Foto Pengaduan"></td>
                <td style="width: 30%; border: 3px solid black">ID Lapor</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].qr_id %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Waktu Lapor</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].time %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Nama Pelapor</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].name %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">NIK</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].nik %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Alamat</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].address %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Kelurahan</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].kelurahan %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Kecamatan</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].kecamatan %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">No. Telp</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].phone %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Pesan Pengaduan</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].desc %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Status</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].status %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Waktu Pengerjaan</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].endTime %></td>
              </tr>
              <tr>
                <td style="width: 30%; border: 3px solid black">Keterangan Status</td>
                <td style="width: 40%; border: 3px solid black"><%= datas[i].solution %></td>
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
      format: 'A3',
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

exports.deletOne = async (req, res, next) => {
  try {
    const doc = await Complaint.findByIdAndUpdate(req.params.id, {
      isArchived: true,
    });
    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    res.status(204).json({
      success: true,
      code: '204',
      message: 'OK',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
