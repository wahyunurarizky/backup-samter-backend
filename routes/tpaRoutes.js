const express = require('express');

const router = express.Router();
const tpaController = require('../controllers/tpaController');

router.route('/').get(tpaController.getAll).post(tpaController.create);
router.route('/:id/generate-qr-code').get(tpaController.generateQr);
router
  .route('/:id')
  .get(tpaController.get)
  .patch(tpaController.update)
  .delete(tpaController.delete);

module.exports = router;
