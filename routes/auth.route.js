const express = require('express');
const router = express.Router();
const { Signup, Login, Logout,sendVerification } = require('../controllers/auth.controller');


console.log('Signup:', typeof Signup);
console.log('Login:', typeof Login);
console.log('Logout:', typeof Logout);

console.log('verification_code',typeof sendVerification);

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', Logout)

 router.patch('/send-verification-code',sendVerification);

module.exports = router;