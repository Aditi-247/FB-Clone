const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/user_controller');
const authenticate = require('../middleware/authenticate');

// router.get('/profile',authenticate, userController.uprofile);
router.get('/profile/:id',authenticate, userController.profile);
router.post('/update/:id',authenticate, userController.update); 
router.get('/post', userController.post);
router.get('/sign-up', userController.signUp);
router.get('/sign-in', userController.signIn);
router.post('/create', userController.create);
router.post('/createsession', userController.createSession);

router.get('/verify/:accesstokenvalue', userController.verify);


router.get('/forgetpassword',userController.forgetpage);
router.post('/forgetmypass',userController.forgetpass);
router.get('/updatepassword/:accesstokenvalue/:email',userController.updatepass);
router.post('/newpass',userController.newpass);

router.get('/sign-out', authenticate, userController.destroySession);
module.exports = router; 