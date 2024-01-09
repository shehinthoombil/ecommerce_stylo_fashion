const mongoose = require("mongoose");

//model to connect to the database or creating collection

const userSchema = new mongoose.Schema({

    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    mobile: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    // confirmPassword: {
    //     type:String,
    //     required:true
    // },
    otp: {
        type: Number,
    },
    
    is_verified: {
        type:Number,
        required:true
    },
    is_block: {
        type:Number,
        default:0
    
    }
    
})

module.exports = mongoose.model('user',userSchema)