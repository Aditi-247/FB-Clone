const express = require('express');

const router = express.Router();
const likesController = require('../controller/like_controller');
const authenticate = require('../middleware/authenticate');

router.post('/toggle', authenticate, likesController.toggleLike);

module.exports = router; 