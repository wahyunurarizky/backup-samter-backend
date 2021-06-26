const mongoose = require('mongoose');
const dotenv = require('dotenv');
// eslint-disable-next-line no-unused-vars
const schedule = require('node-schedule');
const Tagihan = require('./models/tagihanModel');
// const Tps = require('./models/tpsModel');
const Pickup = require('./models/pickupModel');

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
  // .then((con) => {
  .then(() => {
    console.log('DB connection Successfully!');
  });

// create new payment

const test = async () => {
  const m = new Date(Date.now());

  const pickup = await Pickup.aggregate([
    {
      $match: {
        payment_method: 'perbulan',
        arrival_time: {
          $gte: new Date(m.getFullYear(), m.getMonth()),
          $lt: new Date(m.getFullYear() + 1, m.getMonth() + 1),
        },
      },
    },
    {
      $group: {
        _id: '$tps',
        totalLoad: { $sum: '$load' },
      },
    },
    {
      $addFields: {
        tps: '$_id',
        status: 'belum dibayar',
        payment_method: 'perbulan',
        payment_month: new Date(m.getFullYear(), m.getMonth()),
        price: {
          $multiply: ['$totalLoad', process.env.DEFAULT_PRICE_PER_KG * 1],
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

  await Tagihan.insertMany(pickup);

  console.log(pickup);
  // const tps = await Tps.find();

  // // cara ngitung selisih =
  // tps.forEach(async (e) => {
  //   const m = new Date(Date.now());
  //   const load = await Pickup.aggregate([
  //     {
  //       $match: {
  //         tps: e._id,
  //         payment_method: 'perbulan',
  //         arrival_time: {
  //           $gte: new Date(m.getFullYear() - 1, m.getMonth() - 1),
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$tps',
  //         totalLoad: { $sum: '$load' },
  //       },
  //     },
  //   ]);
  //   if (load[0]) {
  //     const exist = await Tagihan.findOne({
  //       tps: e._id,
  //       payment_month: new Date(m.getFullYear(), m.getMonth()),
  //     });
  //     if (!exist) {
  //       console.log('wwkwk');
  //       await Tagihan.create({
  //         status: 'belum dibayar',
  //         payment_method: 'perbulan',
  //         payment_month: new Date(m.getFullYear(), m.getMonth()),
  //         tps: e._id,
  //         price: load[0].totalLoad * process.env.DEFAULT_PRICE_PER_KG,
  //       });
  //     }
  //   } else {
  //     const m = new Date(Date.now());
  //     const exist = await Tagihan.findOne({
  //       tps: e._id,
  //       payment_month: new Date(m.getFullYear(), m.getMonth()),
  //     });
  //     if (!exist) {
  //       console.log('jaja');
  //       await Tagihan.create({
  //         status: 'sudah dibayar',
  //         payment_method: 'perbulan',
  //         payment_month: new Date(m.getFullYear(), m.getMonth()),
  //         tps: e._id,
  //         price: 0,
  //       });
  //     }
  //   }
  // });
};
// schedule.scheduleJob('1 1 1 1 */1 *', test);
test();
// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!!  shutting down ...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
