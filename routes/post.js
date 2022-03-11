const express = require('express');
const router = express.Router();

const postsController = require('../controller/post_controller');
const authenticate = require('../middleware/authenticate');

router.post('/create',authenticate,postsController.create);
router.get('/destroy/:id',authenticate,postsController.destroy);
module.exports = router;