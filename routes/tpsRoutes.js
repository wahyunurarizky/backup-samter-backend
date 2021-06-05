const express = require('express');

const router = express.Router();
const tpsController = require('../controllers/tpsController');

router.route('/').get(tpsController.getAll).post(tpsController.createOne);

router
  .route('/:id')
  .get(tpsController.getOne)
  .patch(tpsController.updateOne)
  .delete(tpsController.deleteOne);

module.exports = router;
