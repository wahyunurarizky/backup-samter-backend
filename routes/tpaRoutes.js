const express = require('express');

const router = express.Router();
const tpaController = require('../controllers/tpaController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get(tpaController.getAll).post(tpaController.create);
router.route('/:id/generate-qr-code').get(tpaController.generateQr);
router
  .route('/:id')
  .get(tpaController.get)
  .patch(tpaController.update)
  .delete(tpaController.delete);

module.exports = router;
