const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "user",
    },
    userName: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        // required: true,
    },
    products: [
        {
            productId: {
                type:String,
                required: true,
                ref:"Product",
            },
            count: {
                type: Number,
                default: 1,
            },
            sum: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                default: 0,
            },
        },
    ],
});

module.exports = mongoose.model("cart", cartSchema);