const mongoose = require("mongoose");

const orderDetails = new mongoose.Schema({
    userId: {
      type:  mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    deliveryDetails: {
        type: Object,
    
      },
      products: [{
        product: {
          type:  String,
          required: true,
          ref: "Product",
        },
        count: {
          type: Number,
          default: 1
        },
        total: {
          type: Number,
          default: 0
        },
        status: {
          type: String,
          default: 'Pending'
    
        }
      }],
      purchaseDate: {
        type: Date,
        required: true
      },
      totalAmount: {
        type: Number,
        
      },
      status: {
        type: String,
        required: true
      },
      paymentMethod: {
        type: String,
        required: true
      },
      paymentStatus: {
        type: String,
        required: true
      },
      shippingMethod: {
        type: String,
    
      },
      shippingFee: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        
      }
    });

    module.exports = mongoose.model('order', orderDetails)