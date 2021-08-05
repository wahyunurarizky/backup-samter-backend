const express = require('express');

const router = express.Router();
const jenisKendaraanController = require('../controllers/jenisKendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));

router
  .route('/')
  .get(jenisKendaraanController.getAll)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    jenisKendaraanController.create
  );

router
  .route('/:id')
  .get(jenisKendaraanController.get)
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    jenisKendaraanController.update
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    jenisKendaraanController.delete
  );

module.exports = router;
