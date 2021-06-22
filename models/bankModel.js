const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  number_account: {
    type: Number,
  },
  name: {
    type: String,
  },
});

const Bank = mongoose.model('Bank', bankSchema);
module.exports = Bank;
