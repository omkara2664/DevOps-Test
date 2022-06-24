const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
        enum: ['Mr', 'Miss']
    },
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value),
            message: `Please enter a valid email address`
        },
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        street: { type: String },
        city: String,
        pincode: Number
    },
    createdAt: { type: Date, defalut: new Date() },
    modifiedAt: { type: Date, defalut: new Date() },
},
    { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);