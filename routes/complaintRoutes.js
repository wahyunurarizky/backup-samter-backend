const express = require('express');

const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(complaintController.getAll)
  .post(complaintController.create);
router
  .route('/:id')
  .get(complaintController.get)
  .patch(authController.restrictTo('pegawai'), complaintController.update);

module.exports = router;
