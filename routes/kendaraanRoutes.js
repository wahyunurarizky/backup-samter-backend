const express = require('express');

const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));
router
  .route('/')
  .get(kendaraanController.getAll)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    kendaraanController.create
  );

router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);

router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    kendaraanController.update
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    kendaraanController.delete
  );

module.exports = router;
