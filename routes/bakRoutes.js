const express = require('express');

const router = express.Router();
const bakController = require('../controllers/bakController');

router
  .route('/')
  .get(bakController.getAll)
  .post(bakController.create);

router.route('/:id/generate-qr-code').get(bakController.generateQr);

router
  .route('/:id')
  .get(bakController.get)
  .patch(bakController.update)
  .delete(bakController.delete);

module.exports = router;
