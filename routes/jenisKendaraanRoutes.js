const express = require('express');

const router = express.Router();
const jenisKendaraanController = require('../controllers/jenisKendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.use(authController.restrictTo('pegawai', 'superadmin'));

router
  .route('/')
  .get(authController.restrictTo('pimpinan'), jenisKendaraanController.getAll)
  .post(jenisKendaraanController.create);

router
  .route('/:id')
  .get(authController.restrictTo('pimpinan'), jenisKendaraanController.get)
  .patch(jenisKendaraanController.update)
  .delete(jenisKendaraanController.delete);

module.exports = router;
