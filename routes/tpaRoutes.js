const express = require('express');

const router = express.Router();
const tpaController = require('../controllers/tpaController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin'));

router
  .route('/')
  .get(authController.restrictTo('pimpinan'), tpaController.getAll)
  .post(tpaController.create);
router.route('/:id/generate-qr-code').get(tpaController.generateQr);
router
  .route('/:id')
  .get(authController.restrictTo('pimpinan'), tpaController.get)
  .patch(tpaController.update)
  .delete(tpaController.delete);

module.exports = router;
