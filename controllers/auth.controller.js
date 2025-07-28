const User = require('../models/user.model');
const { doHash, doHashValidation} = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema } = require('../middleware/validator');

const Signup = async (req, res) => {
   const { email, password } = req.body;
   try {
      const { error, value } = signupSchema.validate({ email, password });
      if (error) {
         return res.status(401).json({ success: false, message: error.details[0].message });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(401).json({ success: false, message: 'User already exists!' });
      }

      const hashPassword = await doHash(password, 12);
      const newUser = new User({
         email,
         password: hashPassword
      });
      const result = await newUser.save();

      result.password = undefined;

      res.status(201).json({
         success: true,
         message: "Your account has been created Successfully",
         result
      });
   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'Internal server error'
      });
   }
};

const Login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const { error, value } = loginSchema.validate({ email, password });
      if (error) {
         return res
            .status(401)
            .json({ success: false, message: error.details[0].message });
      }

      const existingUser = await User.findOne({ email }).select('+password');
      if (!existingUser) {
         return res
            .status(401)
            .json({ success: false, message: 'User does not exists!' });
      }
      const result = await doHashValidation(password, existingUser.password);
      if (!result) {
         return res
            .status(401)
            .json({ success: false, message: 'Invalid credentials!' });
      }
      const token = jwt.sign(
         {
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
         },
         process.env.TOKEN_SECRET,
         {
            expiresIn: '8h',
         }
      );

      res
         .cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
         })
         .json({
            success: true,
            token,
            message: 'logged in successfully',
         });
   } catch (error) {
      console.log(error);
   }
};

module.exports = { Signup, Login };