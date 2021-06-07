const express = require('express');

const router = express.Router();
const tpsController = require('../controllers/tpsController');

router.route('/').get(tpsController.getAll).post(tpsController.create);

router
  .route('/:id')
  .get(tpsController.get)
  .patch(tpsController.update)
  .delete(tpsController.delete);

module.exports = router;
