const express = require('express');

const router = express.Router();
const tpsController = require('../controllers/tpsController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));

router
  .route('/')
  .get(tpsController.getAll)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    tpsController.create
  );
router.route('/get-tps-total').get(tpsController.getTotalTps);
router.route('/:id/generate-qr-code').get(tpsController.generateQr);
router
  .route('/:id')
  .get(tpsController.get)
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    tpsController.update
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    tpsController.delete
  );

// router.route('/getGrafik').get(tpsController.getGrafik);

module.exports = router;
