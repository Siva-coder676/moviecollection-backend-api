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
    
    console.log('=== SEND VERIFICATION STARTED ===');
    console.log('Requested email:', email);
    
    try {
        const existingUser = await User.findOne({ email }).select('+password');
        
        if (!existingUser) {
            console.log('❌ User not found');
            return res.status(404).json({ success: false, message: 'User does not exist!' });
        }
        
        console.log('✅ User found:', existingUser.email);

        if (existingUser.verified) {
            console.log('❌ User already verified');
            return res.status(400).json({ success: false, message: 'You are already verified!' });
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        console.log('Generated code:', codeValue);
        console.log('Sending to:', existingUser.email);
        console.log('From:', process.env.NODE_CODE_SENDING_EMAIL_ADDRESS);

        // Try sending
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Your Verification Code',
            html: `<h1>Your Code: ${codeValue}</h1>`,
            text: `Your code: ${codeValue}`
        });

        console.log('=== EMAIL SEND RESULT ===');
        console.log('MessageId:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        console.log('Response:', info.response);
        console.log('Envelope:', info.envelope);

        // Save to DB
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();
        
        console.log('✅ Code saved to database');
        console.log('=== SEND VERIFICATION COMPLETED ===');

        return res.status(200).json({ 
            success: true, 
            message: "Code sent!",
            debug: {
                messageId: info.messageId,
                accepted: info.accepted
            }
        });
        
    } catch (error) {
        console.error('=== ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
};

module.exports = { Signup, Login, Logout,sendVerification };