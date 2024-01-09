const express = require("express");
const userRoute = express();
const session = require("express-session");
const path = require("path")
const userController = require('../controller/userController')
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

//shop or product list
userRoute.get('/productList',isLogin, userController.productList)
userRoute.get('/productDetails', userController.productDetails)

//cart
userRoute.get('/cart',isLogin, userController.loadCart)
userRoute.post('/cart/:productId',isLogin, userController.addToCart)




module.exports = userRoute
