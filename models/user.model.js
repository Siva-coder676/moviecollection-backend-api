
const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    email: {
        type: "String",
        required: [true, 'Email is required!'],
        trim: true,
        unique: [true, 'Email must be unique!'],
        minLength: [5, "Email must have 5 characters!"],
        lowercase: true
    },
    password: {
        type: "String",
        required: [true, 'Password must be provided!'],
        trim: true,
        select: false

    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    forgotPasswordCode: {
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
    },


},
    {
        timeStamps: true
    }
);

const User = model('User', userSchema);

module.exports = User;

