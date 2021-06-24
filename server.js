const mongoose = require('mongoose');
const Tagihan = require('./models/tagihanModel');
const Tps = require('./models/tpsModel');
const Pickup = require('./models/pickupModel');
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

schedule.scheduleJob('0 0 0 1 * *', async () => {});

const test = async () => {
  const tps = await Tps.find();

  // cara ngitung selisih = 
  tps.forEach(async (e) => {
    const load = await Pickup.aggregate([
      {
        $match: {
          tps: e._id,
          payment_method: 'perbulan',
          arrival_time: { $gte: new Date(2021, 5, 21) },
        },
      },
      {
        $group: {
          _id: '$tps',
          totalLoad: { $sum: '$load' },
        },
      },
    ]);
    if (load[0]) {
      // Tagihan.create({
      //   status: 'belum dibayar',
      //   payment_method: 'perbulan',
      //   payment_month: Date.now(),
      //   tps: e._id,
      // });
      console.log(load[0].totalLoad);
    } else {
      console.log('tidak ada tagihan');
    }
  });
};
test();

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
