const express = require('express');

const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(complaintController.getAll)
  .post(
    complaintController.uploadComplaintPhoto,
    complaintController.resizeComplaintPhoto,
    complaintController.create
  );
router
  .route('/:id')
  .get(complaintController.get)
  .patch(
    authController.protect,
    authController.restrictTo('pegawai'),
    complaintController.update
  );

module.exports = router;
