// const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const Tour = require('../../models/tourModel');
// const User = require('../../models/userModel');
const Kendaraan = require('../models/kendaraanModel');

dotenv.config({ path: 'config.env' });

const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect the database
mongoose
  .connect(database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection Successfully!');
  });

const kendaraan = [
  {
    plat_nomor: 'A BCD 19',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDQ 1234229',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDW 12342349',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDE 19234',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCD 19234',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDQ 19345',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDW 1900',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDE 196',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCD 197',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDQ 198',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDW 159',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDE 149',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCD 139',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDQ 12',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDW 149',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDE 195',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCD 194',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDQ 191',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDW 192',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
  {
    plat_nomor: 'A BCDE 193',
    unit_kerja: 'Ciputat',
    tahun: 2021,
    jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
  },
];

const importData = async () => {
  try {
    await Kendaraan.create(kendaraan, { validateBeforeSave: false });
    console.log('data successfully loaded');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Kendaraan.deleteMany();
    console.log('data successfully deleted');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
