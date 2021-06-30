const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const Tour = require('../../models/tourModel');
// const User = require('../../models/userModel');
const Tagihan = require('../../models/tagihanModel');
const Bak = require('../../models/bakModel');
const User = require('../../models/userModel');
const Pickup = require('../../models/pickupModel');
const Kendaraan = require('../../models/kendaraanModel');
const JenisKendaraan = require('../../models/jenisKendaraanModel');
const Tps = require('../../models/tpsModel');

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

// READ JSON FILE
const jenis = JSON.parse(
  fs.readFileSync(`${__dirname}/jenis_kendaraan.json`, 'utf-8')
);
console.log(jenis);
const kendaraan = JSON.parse(
  fs.readFileSync(`${__dirname}/kendaraan.json`, 'utf-8')
);
console.log(kendaraan);
const tps = JSON.parse(fs.readFileSync(`${__dirname}/tps.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    await JenisKendaraan.create(jenis, { validateBeforeSave: false });
    await Kendaraan.create(kendaraan, { validateBeforeSave: false });
    await Tps.create(tps, { validateBeforeSave: false });
    await User.create(user, { validateBeforeSave: false });
    console.log('data successfully loaded');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    // await Kendaraan.deleteMany();
    // await JenisKendaraan.deleteMany();
    // await Tps.deleteMany();
    // await User.deleteMany();
    await Tagihan.deleteMany({ payment_method: 'perbulan' });

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
