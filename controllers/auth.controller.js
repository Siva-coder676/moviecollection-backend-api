const User = require('../models/user.model');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema } = require('../middleware/validator');
const {transport}= require('../middleware/send.mail');

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

const Logout = async (req, res) => {
   res
      .clearCookie('Authorization')
      .status(200)
      .json({
         status: 200,
         success: true, message: 'Logged out Successfully',

      });
};

const sendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email }).select('+password');
        if (!existingUser) {
            return res
                .status(404)
                .json({ success: false, message: 'User does not exist!' });
        }

        if (existingUser.verified) {
            return res
                .status(400)
                .json({ success: false, message: 'You are already verified!' });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        // Hash and save code BEFORE sending email
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = new Date();
        await existingUser.save();

        // Send response immediately (don't wait for email)
        res.status(200).json({ 
            success: true, 
            message: "Verification code is being sent to your email!" 
        });

        // Send email asynchronously in the background
        transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Your Verification Code</h2>
                    <p>Use this code to verify your account:</p>
                    <h1 style="color: #4CAF50; letter-spacing: 5px;">${codeValue}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        }).catch(error => {
            // Log email errors but don't crash the server
            console.error('Email sending failed:', error);
            // Optional: You could add this to a retry queue or send to error monitoring service
        });
        
    } catch (error) {
        console.log('Error in sendVerification:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { Signup, Login, Logout,sendVerification };