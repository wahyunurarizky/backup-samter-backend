const express = require('express');

const router = express.Router();
const pickupController = require('../controllers/pickupController');
const kendaraanController = require('../controllers/kendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .post(authController.restrictTo('petugas'), pickupController.createPickup);

router.route('/getMyPickup').get(pickupController.getMyPickup);

router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(kendaraanController.update)
  .delete(kendaraanController.delete);

router.use(authController.restrictTo('pegawai'));

router
  .route('/')
  .get(kendaraanController.getAll)
  .post(pickupController.createPickup);

router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);
// belom belom buat
router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(kendaraanController.update)
  .delete(kendaraanController.delete);

module.exports = router;
