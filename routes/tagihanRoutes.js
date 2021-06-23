const express = require('express');

const router = express.Router();
const tagihanController = require('../controllers/tagihanController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get(tagihanController.getAll);
router
  .route('/getMyTagihan')
  .get(
    authController.restrictTo('koordinator ksm'),
    tagihanController.getMyTagihan
  );

router
  .route('/:id')
  .get(tagihanController.get)
  .patch(authController.restrictTo('pegawai'), tagihanController.updateStatus)
  .delete(tagihanController.delete);

router
  .route('/pay/:id')
  .patch(
    authController.restrictTo('koordinator ksm'),
    tagihanController.uploadPaymentPhoto,
    tagihanController.resizePaymentPhoto,
    tagihanController.pay
  );
module.exports = router;