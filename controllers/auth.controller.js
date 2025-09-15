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
        
        
      
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Verification Code',
            html: `<h1>${codeValue}</h1>`
        });

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = new Date();
            await existingUser.save();
            return res.status(200).json({ success: true, message: "Code Sent!" }); // Fixed: 'success' not 'sucess'
        }
        return res.status(400).json({ success: false, message: "Code Send Failed!" }); // Fixed: 'success' not 'sucess'
        
    } catch (error) {
        console.log('Error in sendVerification:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { Signup, Login, Logout,sendVerification };