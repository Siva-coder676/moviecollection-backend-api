const express = require('express');
const router = express.Router();
const { Signup, Login, Logout } = require('../controllers/auth.controller');


console.log('Signup:', typeof Signup);
console.log('Login:', typeof Login);
console.log('Logout:', typeof Logout)

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', Logout)

module.exports = router;