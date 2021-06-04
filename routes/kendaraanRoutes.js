const express = require('express');

const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');

router
  .route('/')
  .get(kendaraanController.getAllKendaraan)
  .post(kendaraanController.createKendaraan);

router
  .route('/:id')
  .get(kendaraanController.getKendaraan)
  .patch(kendaraanController.updateKendaraan)
  .delete(kendaraanController.deleteKendaraan);

module.exports = router;
