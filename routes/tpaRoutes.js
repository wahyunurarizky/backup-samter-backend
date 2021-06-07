const express = require('express');

const router = express.Router();
const tpaController = require('../controllers/tpaController');

router.route('/').get(tpaController.getAllTpa).post(tpaController.createTpa);

router
  .route('/:id')
  .get(tpaController.getTpa)
  .patch(tpaController.updateTpa)
  .delete(tpaController.deleteTpa);

module.exports = router;
