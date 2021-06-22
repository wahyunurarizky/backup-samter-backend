const express = require('express');

const router = express.Router();
const tpsController = require('../controllers/tpsController');

router.route('/').get(tpsController.getAll).post(tpsController.create);
router.route('/:id/generate-qr-code').get(tpsController.generateQr);
router
  .route('/:id')
  .get(tpsController.get)
  .patch(tpsController.update)
  .delete(tpsController.delete);

// router.route('/getGrafik').get(tpsController.getGrafik);

module.exports = router;
