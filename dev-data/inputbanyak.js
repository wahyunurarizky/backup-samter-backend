// const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const Tour = require('../../models/tourModel');
// const User = require('../../models/userModel');
const Bak = require('../models/bakModel');
const Pickup = require('../models/pickupModel');

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

const bak = [
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
  {
    empty_weight: 100,
    max_weight: 3000,
  },
];

const importData = async () => {
  try {
    await Bak.create(bak, { validateBeforeSave: false });
    console.log('data successfully loaded');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Pickup.deleteMany();
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
