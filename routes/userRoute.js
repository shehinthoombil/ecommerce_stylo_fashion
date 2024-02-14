const express = require("express");
const userRoute = express();
const session = require("express-session");
const path = require("path")
const userController = require('../controller/userController');
const accountController = require('../controller/accountController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController')
const config = require("../config/config");
userRoute.set('view engine', 'ejs')
userRoute.set('views', './views/users')
const { isLogin, isLogout } = require('../middlewares/userAuth')


userRoute.use(session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: true,
}));

//HOME PAGE
userRoute.get('/', userController.loadHome)

//REGISTER //LOGIN //LOGOUT
userRoute.get('/register', userController.loadRegister) 
userRoute.post('/register', userController.insertUser)
userRoute.get('/login', isLogout, userController.loginLoad)
userRoute.post('/login', isLogout, userController.verifyLogin)

userRoute.get('/logout', isLogin, userController.logoutUser)


//EMAIL VERIFY OR OTP 
userRoute.post('/verify', userController.verifyMail)
userRoute.post('/resendOtp', userController.resendOTP)

//shop or product list
userRoute.get('/productList',isLogin, userController.productList)
userRoute.get('/productDetails', userController.productDetails)

//cart
userRoute.get('/cart',isLogin, userController.loadCart)
userRoute.post('/addToCart/:productId',isLogin, userController.addToCart)
userRoute.post('/updateCartQuantity',isLogin, userController.updateCartQuantity)
userRoute.get('/removeCartProduct', isLogin, userController.removeCartProduct);

//my account
userRoute.get('/myAccount',isLogin,accountController.loadMyAccount)
userRoute.get('/editAddress',isLogin,accountController.loadEditaddress)
userRoute.post('/editAddress',isLogin,accountController.editAddress)
userRoute.get('/addAddress',isLogin,accountController.loadAddAddress)
userRoute.post('/addAddress',isLogin,accountController.addAddress)
userRoute.post('/updateDetails',isLogin,accountController.updateUserDetails)

//wallet
userRoute.get('/wallet',isLogin, accountController.showWallet)

//checkout and order
userRoute.get('/checkout',isLogin, orderController.loadCheckout)
userRoute.post('/orderPlace', isLogin, orderController.placeOrder)
userRoute.get('/orderSuccess', isLogin, orderController.orderSuccess)
userRoute.get('/order-Cancel', isLogin, orderController.OrderCancelPage)
userRoute.post('/cancelOrder', isLogin, orderController.cancelOrder)
userRoute.get('/orderCancel', isLogin, orderController.OrderCancelPage)

//contactUs

userRoute.get('/contactUs', isLogin, userController.loadContactUs)

//payment 
userRoute.post('/verifyPayment', isLogin, orderController.verifyPayment)

//coupon
userRoute.post('/applyCoupon', isLogin, couponController.applyCoupon)



module.exports = userRoute
