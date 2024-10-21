const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkController = require('../controllers/check.controller');

router.post('/check-spelling', checkController.checkSpelling);
router.post('/save-spell-check', auth, checkController.saveSpellCheck);

module.exports = router;
