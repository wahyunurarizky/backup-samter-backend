const mongoose = require('mongoose');
const dotenv = require('dotenv');
// eslint-disable-next-line no-unused-vars
const schedule = require('node-schedule');
const Tagihan = require('./models/tagihanModel');
const Tps = require('./models/tpsModel');
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
          // PENTING {GANTI}
          $gte: new Date(m.getFullYear() - 1, m.getMonth() - 1),
          $lt: new Date(m.getFullYear(), m.getMonth()),
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

  const neObj = [];

  pickup.forEach((e) => {
    const x = {
      _id: {
        $ne: e.tps,
      },
    };
    neObj.push(x);
  });

  let tps;
  if (!neObj.length) {
    tps = await Tps.find();
  } else {
    tps = await Tps.find({
      $and: neObj,
    });
  }

  tps.forEach((e) => {
    pickup.push({
      tps: e._id,
      totalLoad: 0,
      price: 0,
      status: 'sudah dibayar',
      payment_method: 'perbulan',
      payment_month: new Date(m.getFullYear(), m.getMonth()),
    });
  });

  const tagihan = await Tagihan.find({
    payment_month: new Date(m.getFullYear(), m.getMonth()),
  });

  await Tagihan.insertMany(
    pickup.filter((e) => {
      // console.log(tagihan);
      if (tagihan.filter((y) => `${y.tps._id}` === `${e.tps}`).length > 0) {
        return false;
      }
      return true;
    })
  );
};
schedule.scheduleJob('1 1 1 1 */1 *', test);

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
