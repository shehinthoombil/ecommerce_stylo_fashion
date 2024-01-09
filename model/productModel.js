const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        // required: true,
    },
    price: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});


const product = mongoose.model('Product', productSchema);
module.exports = product;