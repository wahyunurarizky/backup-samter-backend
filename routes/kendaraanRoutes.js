const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');

router
    .route('/')
    .get(kendaraanController.getAllKendaraan)
    .post(kendaraanController.createKendaraan);
    

// router
    // .route('/:id')
    // .get(userController.getUser)
    // .patch(userController.updateUser)
    // .delete(userController.deleteUser);

module.exports = router;