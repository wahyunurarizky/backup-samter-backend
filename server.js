const mongoose = require('mongoose');
const Kendaraan = require('./models/kendaraanModel');
const schedule = require('node-schedule');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!! 💥 shutting down...');
  console.log(err);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');

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
  .then((con) => {
    console.log('DB connection Successfully!');
  });

// create new payment

schedule.scheduleJob('* * * 1 * *', async () => {
  try {
    await Kendaraan.create({
      plat_nomor: 'A BCD 19',
      unit_kerja: 'Ciputat',
      tahun: 2021,
      jenis_kendaraan_id: '60be480c92f5e22d68cf3ff6',
    });
  } catch (err) {
    console.log(err);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!!  shutting down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
