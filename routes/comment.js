const express = require('express');
const router = express.Router();

const commentsController = require('../controller/comment_controller');
const authenticate = require('../middleware/authenticate');

router.post('/create',authenticate,commentsController.create);
router.get('/destroy/:id',authenticate,commentsController.destroy);
module.exports = router; 