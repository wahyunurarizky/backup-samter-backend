const express = require('express');

const router = express.Router();
const tagihanController = require('../controllers/tagihanController');

router.route('/').get(tagihanController.getAll).post(tagihanController.create);

router
  .route('/:id')
  .get(tagihanController.get)
  .patch(tagihanController.update)
  .delete(tagihanController.delete);

module.exports = router;
