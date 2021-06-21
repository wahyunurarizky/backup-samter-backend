const express = require('express');

const router = express.Router();
const bankController = require('../controllers/bankController');

router.route('/').get(bankController.getAll).post(bankController.create);
router
  .route('/:id')
  .get(bankController.get)
  .patch(bankController.update)
  .delete(bankController.delete);

module.exports = router;
