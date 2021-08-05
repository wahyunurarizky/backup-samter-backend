const express = require('express');

const router = express.Router();
const bakController = require('../controllers/bakController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));
router
  .route('/')
  .get(bakController.getAll)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    bakController.create
  );

router.route('/:id/generate-qr-code').get(bakController.generateQr);

router
  .route('/:id')
  .get(bakController.get)
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    bakController.update
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    bakController.delete
  );

module.exports = router;
