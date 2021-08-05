const express = require('express');

const router = express.Router();
const tpaController = require('../controllers/tpaController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));

router
  .route('/')
  .get(tpaController.getAll)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    tpaController.create
  );
router.route('/:id/generate-qr-code').get(tpaController.generateQr);
router
  .route('/:id')
  .get(tpaController.get)
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    tpaController.update
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    tpaController.delete
  );

module.exports = router;
