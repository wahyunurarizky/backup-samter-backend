const express = require('express');

const router = express.Router();
const jenisKendaraanController = require('../controllers/jenisKendaraanController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(jenisKendaraanController.getAll)
  .post(jenisKendaraanController.create);

router
  .route('/:id')
  .get(jenisKendaraanController.get)
  .patch(jenisKendaraanController.update)
  .delete(jenisKendaraanController.delete);

module.exports = router;
