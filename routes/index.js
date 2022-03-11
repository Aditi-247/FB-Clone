const express = require('express');
const router = express.Router();
const homeController = require('../controller/home_controller');
const authenticate = require('../middleware/authenticate');

router.get('/', homeController.home);
router.get('/home', authenticate, homeController.homeinside);
router.use('/user', require('./user'));
router.use('/posts',require('./post'));
router.use('/comments',require('./comment'));
router.use('/likes',require('./like'));
module.exports = router;