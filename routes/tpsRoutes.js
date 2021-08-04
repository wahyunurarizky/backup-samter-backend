const express = require('express');

const router = express.Router();
const tpsController = require('../controllers/tpsController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin'));

router
  .route('/')
  .get(authController.restrictTo('pimpinan'), tpsController.getAll)
  .post(tpsController.create);
router.route('/get-tps-total').get(tpsController.getTotalTps);
router.route('/:id/generate-qr-code').get(tpsController.generateQr);
router
  .route('/:id')
  .get(authController.restrictTo('pimpinan'), tpsController.get)
  .patch(tpsController.update)
  .delete(tpsController.delete);

// router.route('/getGrafik').get(tpsController.getGrafik);

module.exports = router;
