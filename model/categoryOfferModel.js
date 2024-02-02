const mongoose = require('mongoose')

const categoryOfferSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    categoryname: {
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
});

const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema)

module.exports = CategoryOffer;