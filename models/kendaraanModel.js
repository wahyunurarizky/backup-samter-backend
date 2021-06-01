const mongoose = require("mongoose");

const kendaraanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  plat_nomor: {
    type: String,
    required: true,
  },
});

const Kendaraan = mongoose.model("Kendaraan", kendaraanSchema);
module.exports = Kendaraan;