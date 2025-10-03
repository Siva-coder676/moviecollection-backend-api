
const nodemailer= require('nodemailer');


const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 2525,
    secure: false,
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports={
    transport
};