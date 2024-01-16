const User = require('../model/userModel')
const category = require("../model/categoryModel");
const product = require('../model/productModel');
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Order = require('../model/orderModel');

//load or render checkout page

const loadCheckout = async (req,res) => {
    try {
        let accountDetails
        let userName
        let UserAddress;
        let addressId = req.query.id
        if (req.session.user_id) {
            const user = await User.findOne({ _id: req.session.user_id });
            const addresses = await Address.find({ User: req.session.user_id });
      
      
            if (user) {
              userName = user.name;
              accountDetails = user;
              UserAddress = addresses;
      
            }
          }
      
          const userId = req.session.user_id;
          const cartData = await Cart.findOne({ userid: userId }).populate("products.productId");
      
         
            res.render('checkout',{userName, accountDetails ,UserAddress, cartData: cartData});
         
    } catch (error) {
        console.log(error.message);
    }
}

//place order 
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.body.selectedAddress;

    const user = await User.findOne({ _id: userId });
    const address = await Address.findOne({ _id: addressId });

    if (!user || !address) {
      console.log('User or address not found');
      return res.status(400).json({ error: 'User or address not found' });
    }

    const cartData = await Cart.findOne({ userid: userId });
    const totalAmount = cartData.total;
    const orderProducts = [];

    for (const cartProduct of cartData.products) {
      orderProducts.push({
        productId: cartProduct.productId,
        quantity: cartProduct.count,
        total: cartProduct.totalPrice
      });
    }
    console.log(userId+"id");
   
    const newOrder = new Order({

      userId: userId,
      deliveryDetails: {
        address: address,
      },
      products: orderProducts,
      purchaseDate: new Date(),
      totalAmount: 100,
      status: 'placed',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      shippingFee: '0',

    });

    const savedOrder = await newOrder.save();

    // Function to decrease product quantities
    // async function decreaseProductQuantities(orderProducts) {
    //   for (const orderProduct of orderProducts) {
    //     const productData = await product.findOne({ _id: orderProduct.productId });

    //     if (productData) {
    //       const newQuantity = productData.quantity - orderProduct.quantity;
    //       const qa = await product.updateOne({ _id: orderProduct.productId }, { quantity: newQuantity });
    //       console.log(qa);
    //     }
    //   }
    // }

    // Clear the user's cart
    await Cart.updateOne({ userid: userId }, { $set: { products: [] } });
    // const successPageURL = '/order-success';

    // if (paymentMethod === 'cod') {
    //   console.log('cod');

      // await decreaseProductQuantities(orderProducts);
    //   await Cart.deleteOne({ userid: userId });
    //   return res.json({ success: true });
    // } else {
    //   console.log('Invalid payment method');
    //   return res.status(400).json({ error: 'Invalid payment method' });
    // }

      res.redirect('/orderSuccess')
  } catch (error) {
    console.log(error);
  }
}

// order placed success page
const orderSuccess = async (req, res) => {
  try {
    const userId = req.session.user_id;

    console.log('Order placed successfully');
    res.render('orderSuccess');
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};


module.exports = {
    loadCheckout,
    placeOrder,
    orderSuccess,

}