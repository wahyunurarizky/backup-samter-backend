const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.get('/resetPassword/:token', authController.cekToken);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
// potect artinya harus login dan membawa data user yg login
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
// router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateMyPassword', authController.updatePassword);

// Only admin have permission to access for the below APIs
router.use(authController.restrictTo('pegawai', 'superadmin', 'pimpinan'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    authController.restrictTo('superadmin', 'pegawai'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.createUser
  );

router
  .route('/:id')
  .get(
    authController.restrictTo('pimpinan', 'superadmin', 'pegawai'),
    userController.getUser
  )
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUser
  )
  .delete(
    authController.restrictTo('superadmin', 'pegawai'),
    userController.deleteUser
  );

router
  .route('/:id/resetPassword')
  .patch(
    authController.restrictTo('superadmin', 'pegawai'),
    userController.resetUserPassword
  );

// router.route('/qr/:qrid').get(userController.getPetugasByQrId);

module.exports = router;
