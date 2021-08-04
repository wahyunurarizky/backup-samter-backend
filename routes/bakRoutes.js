const express = require('express');

const router = express.Router();
const bakController = require('../controllers/bakController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin'));
router
  .route('/')
  .get(authController.restrictTo('pimpinan'), bakController.getAll)
  .post(bakController.create);

router
  .route('/:id/generate-qr-code')
  .get(authController.restrictTo('pimpinan'), bakController.generateQr);

router
  .route('/:id')
  .get(authController.restrictTo('pimpinan'), bakController.get)
  .patch(bakController.update)
  .delete(bakController.delete);

module.exports = router;
