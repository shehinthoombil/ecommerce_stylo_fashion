const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "user",
    },
    productid:{
        type:Array,
        required:true,
        ref:"Product"
    }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;