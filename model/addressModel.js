const mongoose = require("mongoose");

// Define the schema for the Order
const UserAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    address: [
        {
            fullname: {
              type: String,
              required: true,
              trim: true,
            },
            mobile: {
              type: Number,
              required: true,
              trim: true,
            },
            email: {
              type: String,
              required: true,
              trim: true,
            },
            houseNo: {
              type: Number,
              required: true,
              trim: true,
            },
            city: {
              type: String,
              required: true,
              trim: true,
            },
            state: {
              type: String,
              required: true,
              trim: true,
            },
            zipcode: {
              type: Number,
              required: true,
              trim: true,
            },
            additionalDetails: {
              type: String,
            //   required: true,
              trim: true,
            },
          }
    ]
});

module.exports = mongoose.model('Address',UserAddressSchema); // Changed model name to

    