const express = require('express');

const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .get(kendaraanController.getAll)
  .post(kendaraanController.create);

router.route('/:id/generate-qr-code').get(kendaraanController.generateQr);

router
  .route('/:id')
  .get(kendaraanController.get)
  .patch(kendaraanController.update)
  .delete(kendaraanController.delete);

module.exports = router;
