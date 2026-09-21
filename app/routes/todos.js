const express = require('express');
const todoController = require('../controllers/todoController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', todoController.list);
router.get('/:id', todoController.getById);
router.post('/', todoController.create);
router.put('/:id', todoController.update);
router.patch('/:id/status', todoController.updateStatus);
router.delete('/:id', todoController.remove);

module.exports = router;