const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail', // Use Gmail's built-in service
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD.replace(/\s/g, '') // Remove any spaces
    },
    pool: true, // Enable connection pooling
    maxConnections: 5, // Max concurrent connections
    maxMessages: 10, // Max messages per connection
    rateDelta: 1000, // Time between messages (ms)
    rateLimit: 5 // Max messages per rateDelta
});

// Verify connection on startup
transport.verify(function(error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to send emails');
    }
});

module.exports = {
    transport
};