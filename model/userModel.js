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
    },
    
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },


    wallet: {
        type: Number,
        default: 0
    },
    walletHistory: [{
            date: {
                type: Date,
                default: Date.now 
            },
            amount: {
                type: Number
            },
            message:{
                type: String
            },
            type: {
                type: String,
                default: 'credit' 
            }

    }],
    referalCode: {
        type:String,
    }

    
});

module.exports = mongoose.model('user',userSchema)