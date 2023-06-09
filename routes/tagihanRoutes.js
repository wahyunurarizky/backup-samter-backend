const express = require('express');

const router = express.Router();
const tagihanController = require('../controllers/tagihanController');
const authController = require('../controllers/authController');

router.route('/export').get(tagihanController.exportPdf);

router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictTo('pegawai', 'pimpinan', 'superadmin'),
    tagihanController.getAll
  );
router
  .route('/getMyTagihan')
  .get(
    authController.restrictTo('koordinator ksm'),
    tagihanController.getMyTagihan
  );

router
  .route('/:id')
  .get(
    authController.restrictTo(
      'pegawai',
      'pimpinan',
      'superadmin',
      'koordinator ksm'
    ),
    tagihanController.get
  )
  .patch(
    authController.restrictTo('pegawai', 'superadmin'),
    tagihanController.updateStatus
  )
  .delete(
    authController.restrictTo('pegawai', 'superadmin'),
    tagihanController.delete
  );

router
  .route('/pay/:id')
  .patch(
    authController.restrictTo('koordinator ksm'),
    tagihanController.uploadPaymentPhoto,
    tagihanController.resizePaymentPhoto,
    tagihanController.pay
  );

router.route('/handling').post((req, res, next) => {
  console.log(req.body);
});
router
  .route('/transaction/:tagihanId')
  .get(tagihanController.getTransactionToken);
module.exports = router;
