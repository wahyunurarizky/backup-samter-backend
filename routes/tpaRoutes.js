const express = require('express');

const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');

router
  .route('/')
  .get(kendaraanController.getAllTpa)
  .post(kendaraanController.createKendaraan);

router
  .route('/:id')
  .get(kendaraanController.getTpa)
  .patch(kendaraanController.updateTpa)
  .delete(kendaraanController.deleteTpa);

module.exports = router;
