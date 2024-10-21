const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', auth, authController.profile);
router.post('/face-login', authController.faceLogin);
router.post('/check-faces', authController.checkFaces);

module.exports = router;
