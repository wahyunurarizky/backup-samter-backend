const express = require('express');

const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const kendaraanController = require('../controllers/kendaraanController');

router
  .route('/')
  .get(kendaraanController.getAll)
  .post(checkoutController.createCheckout);

router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);
// belom belom buat
router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(kendaraanController.update)
  .delete(kendaraanController.delete);

module.exports = router;
