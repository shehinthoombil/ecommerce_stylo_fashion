const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productname: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        enum: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    is_block: {
        type: Number,
        default: 0,
    },
})

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;