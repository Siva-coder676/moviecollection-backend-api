const express = require('express');
const router = express.Router();
const {Signup, Login} = require('../controllers/auth.controller');


console.log('Signup:', typeof Signup);
console.log('Login:', typeof Login);

router.post('/signup', Signup);
router.post('/login', Login);

module.exports = router;