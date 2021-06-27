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
  .get(
    authController.restrictTo('petugas', 'koordinator ksm', 'operator tpa'),
    pickupController.getMyPickup
  );
router
  .route('/qr/:qr_id')
  .get(
    authController.restrictTo('petugas', 'operator tpa'),
    pickupController.getByQr
  );

router
  .route('/getMyPickupQR')
  .get(authController.restrictTo('petugas'), pickupController.generateQr);
router
  .route('/lanjut/:id')
  .get(authController.restrictTo('petugas'), pickupController.isAlreadyDone);

router
  .route('/monthly-data/:month/:year')
  .get(
    authController.restrictTo('pegawai', 'pimpinan', 'koordinator ksm'),
    pickupController.getAverage
  );
router
  .route('/monthly-data')
  .get(
    authController.restrictTo('pegawai', 'pimpinan', 'koordinator ksm'),
    pickupController.getAverage
  );

router
  .route('/weekly-data/:month/:year')
  .get(
    authController.restrictTo('pegawai', 'pimpinan', 'koordinator ksm'),
    pickupController.getAverageWeekly
  );
router
  .route('/weekly-data')
  .get(
    authController.restrictTo('pegawai', 'pimpinan', 'koordinator ksm'),
    pickupController.getAverageWeekly
  );

router
  .route('/:id')
  .get(authController.restrictTo('pegawai'), pickupController.get);

router
  .route('/')
  .get(authController.restrictTo('pegawai'), pickupController.getAll);

router
  .route('/inputLoad/:id')
  .patch(authController.restrictTo('operator tpa'), pickupController.inputLoad);
// belom belom buat

module.exports = router;
