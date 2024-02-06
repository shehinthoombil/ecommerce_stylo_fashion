const crypto = require('crypto');
const User = require('../model/userModel')
const category = require("../model/categoryModel");
const product = require('../model/productModel');
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Order = require('../model/orderModel');
const Coupon = require('../model/couponModel')
const Razorpay = require('razorpay')

//razorpay instance
var razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY, 
  })



//load or render checkout page

// const loadCheckout = async (req, res) => {
//   try {
//     let accountDetails
//     let userName
//     let UserAddress;
//     let addressId = req.query.id
//     if (req.session.user_id) {
//       const user = await User.findOne({ _id: req.session.user_id });
//       const addresses = await Address.find({ User: req.session.user_id });
      

//       if (user) {
//         userName = user.name;
//         accountDetails = user;
//         UserAddress = addresses;

//       }
//     }

//     const userId = req.session.user_id;
//     const cartData = await Cart.findOne({ userid: userId }).populate("products.productId");
    
//     if (cartData && Array.isArray(cartData.products)) {
//       let totalSum = 0;

//       // Calculate totalSum outside the loop
//       cartData.products.forEach(product => {
//           product.sum = product.count * product.price;
//           totalSum += product.sum;
//       });
//       let datatotal = cartData.products.map((products) => {
//         return products.price * products.count;
//       });
//       const updatedCart = await Cart.findOneAndUpdate(
//         { userid: userId },
//         { $set: { total: totalSum } },
//         { new: true }
//       );
//       console.log("----------------------"+updatedCart);
//       res.render('checkout', { userName, accountDetails, UserAddress, cartData: cartData,datatotal,totalSum });
//     }
//     res.render('checkout', { userName, accountDetails, UserAddress, cartData: cartData,datatotal,totalSum });

//   } catch (error) {
//     console.log(error.message);
//   }
// }
const loadCheckout = async (req, res) => {
  try {
    let accountDetails;
    let userName;
    let UserAddress;
    let addressId = req.query.id;
    
    const coupon = await Coupon.find({  })
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


    let totalSum = 0;
    let datatotal = []; // Declare datatotal outside the if block

    if (cartData && Array.isArray(cartData.products)) {
      const discAmount = coupon.discountamount

      // Calculate totalSum outside the loop
      cartData.products.forEach(product => {
        product.sum = product.count * product.price;
        totalSum += product.sum;
        datatotal.push(product.price * product.count); // Push datatotal values
      });

      const updatedCart = await Cart.findOneAndUpdate(
        { userid: userId },
        { $set: { total: totalSum } },
        { new: true }
      );

      console.log("----------------------" + updatedCart);
    }

    res.render('checkout', { userName, accountDetails, UserAddress, datatotal, totalSum, cartData,coupon });
    // res.render('checkout', { userName, accountDetails, UserAddress, datatotal, totalSum, cartData: cartData, coupon, discAmount });

  } catch (error) {
    console.log(error.message);
  }
}



//place order 
// const placeOrder = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const addressId = req.body.selectedAddress;

//     const user = await User.findOne({ _id: userId });
//     const address = await Address.findOne({ _id: addressId });

//     if (!user || !address) {
//       console.log('User or address not found');
//       return res.status(400).json({ error: 'User or address not found' });
//     }

//     const cartData = await Cart.findOne({ userid: userId });
//     const totalAmount = cartData.total;
//     const orderProducts = [];

//     for (const cartProduct of cartData.products) {
//       orderProducts.push({
//         productId: cartProduct.productId,
//         quantity: cartProduct.count,
//         total: cartProduct.totalPrice
//       });
//     }
//     console.log(userId + "id");

//     const newOrder = new Order({

//       userId: userId,
//       deliveryDetails: {
//         address: address,
//       },
//       products: orderProducts,
//       purchaseDate: new Date(),
//       totalAmount: 100,
//       status: 'placed',
//       paymentMethod: 'cod',
//       paymentStatus: 'paid',
//       shippingFee: '0',

//     });

//     const savedOrder = await newOrder.save();

//     // Function to decrease product quantities
//     // async function decreaseProductQuantities(orderProducts) {
//     //   for (const orderProduct of orderProducts) {
//     //     const productData = await product.findOne({ _id: orderProduct.productId });

//     //     if (productData) {
//     //       const newQuantity = productData.quantity - orderProduct.quantity;
//     //       const qa = await product.updateOne({ _id: orderProduct.productId }, { quantity: newQuantity });
//     //       console.log(qa);
//     //     }
//     //   }
//     // }

//     // Clear the user's cart
//     await Cart.updateOne({ userid: userId }, { $set: { products: [] } });
//     // const successPageURL = '/order-success';

//     // if (paymentMethod === 'cod') {
//     //   console.log('cod');

//     // await decreaseProductQuantities(orderProducts);
//     //   await Cart.deleteOne({ userid: userId });
//     //   return res.json({ success: true });
//     // } else {
//     //   console.log('Invalid payment method');
//     //   return res.status(400).json({ error: 'Invalid payment method' });
//     // }

//     res.redirect('/orderSuccess')
//   } catch (error) {
//     console.log(error);
//   }
// }
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.body.selectedAddress;
    const paymentMethod = req.body['payment-method'];
    const status = paymentMethod === 'cod' ? 'placed' : 'pending';
    
    const statusLevel = status === 'placed' ? 1 : 0;
    console.log('status level working');

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
        product: cartProduct.productId,  // Set the 'product' field to 'productId'
        count: cartProduct.count,
        total: cartProduct.totalPrice,
        // status: 'Pending',  // You may adjust the default value as needed
      });
    }

    const newOrder = new Order({
      userId: userId,
      deliveryDetails: { address: address },
      products: orderProducts,
      purchaseDate: new Date(),
      totalAmount: totalAmount, // Use the totalAmount variable
      status: status,
      paymentMethod: paymentMethod,
      paymentStatus: 'paid',
      // paymentStatus: 'pending',
      shippingFee: '0',
    });
    const savedOrder = await newOrder.save();

    // Clear the user's cart
    await Cart.updateOne({ userid: userId }, { $set: { products: [] } });
    const successPageURL = '/orderSuccess';
    // res.redirect('/orderSuccess');

    if (paymentMethod === 'online') {
      
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: savedOrder._id.toString()
        // receipt: "" + savedOrder._id,
        };

        razorpayInstance.orders.create(options, function(err, order) {
          return res.json({ order });
          // if(err){
          //   console.log(err);
          //   return res.status(500).json({ error: 'Razorpay order creation failed' });
          // }
          //   console.log("New Order:",order);
          //   return res.json({ order });
            
        })
    } else if (paymentMethod === 'cod') {
      console.log('COD order placed');

      await Cart.deleteOne({ userid: userId });
      return res.json({ success: true });

    } else {
      console.log('Invalid payment method');
      return res.status(400).json({ error: 'Invalid payment method' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


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

//verify online payment
const verifyPayment = async (req,res)=> {
  console.log(verifyPayment,"verifykkeri");
  try {
    const user_id = req.session.user_id;
    const cartData = await Cart.findOne({ user:   user_id });
    const paymentData = req.body
    const products = cartData.products;
    const details = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(
      paymentData.payment.razorpay_order_id +
        "|" +
        paymentData.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");

    if (hmacValue === paymentData.payment.razorpay_signature) {
        await Order.findByIdAndUpdate(
          { _id: paymentData.order.receipt },
          { $set: { paymentStatus: "placed", paymentId: paymentData.payment.razorpay_payment_id } }
        );
        await Cart.deleteOne({ userid: user_id })
        console.log('XP 9');
        return res.json({ placed: true })
      }   
  } catch (error) {
    console.log(error.message);
  }
}

// show cancel order page

const OrderCancelPage = async (req, res) => {
  try {

    res.render('orderCancel')
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}

// cancel order

const cancelOrder = async (req, res) => {
  try {
    const type = req.body.type;
    const id = req.body.id;
    if (type === 'order') {

      // Handle order cancellation
      const order = await Order.findOne({ _id: id });
      const user = order.userId
      const tAmount = order.totalAmount
      console.log(tAmount);
      const count = order.products[0].count;
      const reason = "REASON FOR CANCEL :" + req.body.reason;
      console.log(reason);
      if (order) {
        order.status = 'cancelled';
        order.notes = reason
        await order.save();
        for (const orderProduct of order.products) {
          const proDB = await product.findOne({ _id: orderProduct.productId });
          if (proDB) {
            proDB.quantity += count;
            await proDB.save();
          }
        }
        res.json({ success: true });

      }

      else {
        res.status(400).json({ error: 'Order not found' });
      }

    } else {
      res.status(400).json({ error: 'Invalid request type' });
    }


  } catch (error) {
     console.log(error.message);
  }
}







module.exports = {
  loadCheckout,
  placeOrder,
  verifyPayment,
  orderSuccess,
  OrderCancelPage,
  cancelOrder,

}