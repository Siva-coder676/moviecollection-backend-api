// standalone-email-test.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Environment variables:');
console.log('Email:', process.env.NODE_CODE_SENDING_EMAIL_ADDRESS);
console.log('Password exists:', !!process.env.NODE_CODE_SENDING_EMAIL_PASSWORD);

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD.replace(/\s/g, '')
    }
});

// First verify connection
transport.verify()
    .then(() => {
        console.log('✅ SMTP connection verified!');
        
        // Then try sending
        return transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS, // Send to yourself
            subject: 'Test - ' + new Date().toISOString(),
            html: '<h1>Test Email - Code: 123456</h1>',
            text: 'Test Email - Code: 123456'
        });
    })
    .then(info => {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        console.log('Response:', info.response);
        console.log('\n📧 Check your inbox (and spam folder)!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.command) console.error('Command:', error.command);
        process.exit(1);
    });