const express = require('express');

const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const kendaraanController = require('../controllers/kendaraanController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(kendaraanController.getAll)
  .post(
    authController.protect,
    authController.restrictTo('petugas'),
    checkoutController.createCheckout
  );

router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);
// belom belom buat
router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(kendaraanController.update)
  .delete(kendaraanController.delete);

module.exports = router;
