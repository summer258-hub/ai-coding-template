const express = require('express');
const tagController = require('../controllers/tagController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', tagController.list);
router.post('/', tagController.create);
router.put('/:id', tagController.update);
router.delete('/:id', tagController.remove);

module.exports = router;