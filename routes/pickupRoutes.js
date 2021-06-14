const express = require('express');

const router = express.Router();
const pickupController = require('../controllers/pickupController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .post(authController.restrictTo('petugas'), pickupController.createPickup);
router
  .route('/getMyPickup')
  .get(authController.restrictTo('petugas'), pickupController.getMyPickup);

router.use(authController.restrictTo('pegawai'));

router.route('/:id').get(pickupController.get);
// .patch(pickupController.update)
// .delete(pickupController.delete);

router.route('/').get(pickupController.getAll);

// router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);
// belom belom buat

module.exports = router;
