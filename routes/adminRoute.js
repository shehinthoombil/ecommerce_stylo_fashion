const express = require("express");
const session = require("express-session");
const adminRoute = express();
const adminController = require('../controller/adminController')
const offerController = require('../controller/offerController')
const couponController = require('../controller/couponController')
const imageUpload = require('../middlewares/imgUploads')
const path = require("path")
const config = require("../config/config");
adminRoute.set('view engine', 'ejs')
const { isLogin, isLogout } = require('../middlewares/adminAuth')

adminRoute.use(session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: true,
}));

adminRoute.get('/',isLogout, adminController.loadLogin)
adminRoute.post('/adminsignIn', adminController.adminVerify)

adminRoute.get('/dashboard', isLogin,  adminController.loadDashboard)
adminRoute.get('/adminlogout',isLogin, adminController.logoutAdmin)
adminRoute.get('/userManagement',isLogin,  adminController.loadUserManagement)
adminRoute.get('/block-user', isLogin,  adminController.blockUser)
//categories
adminRoute.get('/category/categories', isLogin,  adminController.loadCategories)
adminRoute.get('/category/addCategory', isLogin,  adminController.loadAddCategories)
adminRoute.get('/category/editCategory', isLogin,  adminController.loadEditCategories)
adminRoute.post('/categories', isLogin,  imageUpload.uploadCategoryImage, imageUpload.resizeCategoryImage, adminController.addCategory)
adminRoute.post('/category/editCategory',isLogin, imageUpload.uploadCategoryImage, imageUpload.resizeCategoryImage, adminController.editCategory)

//products
adminRoute.get('/product/products',isLogin, adminController.loadProducts)
adminRoute.get('/product/addProduct',isLogin,  adminController.loadAddProduct)
adminRoute.get('/product/editproduct',isLogin,  adminController.loadEditproduct)
adminRoute.post('/product/editProduct',isLogin, imageUpload.uploadProductImages, imageUpload.resizeProductImages, adminController.editProduct)
adminRoute.post('/product/addProduct', isLogin,  imageUpload.uploadProductImages, imageUpload.resizeProductImages, adminController.addProduct)
adminRoute.get('/block-pro', isLogin,  adminController.listUnlistProduct)
adminRoute.delete('/deleteExistImage', isLogin, adminController.deleteExistImage);
adminRoute.get('/deletePro', isLogin,  adminController.deleteProduct)

//orders
adminRoute.get('/orderManagement',isLogin,  adminController.loadOrder);
adminRoute.post('/updateOrderStatus', isLogin,  adminController.updateOrderStatus);

//filter chart
adminRoute.get('/chartWeek', isLogin,  adminController.chartFilterWeek);
adminRoute.get('/chartMonth', isLogin,  adminController.chartFilterMonth);
adminRoute.get('/chartYear', isLogin,  adminController.chartFilterYear);

//sales
adminRoute.get('/salesSummary',  adminController.loadSalesSummary);
adminRoute.get('/sales', isLogin,  adminController.filterSaleYear)

//product offers
adminRoute.get('/offers', isLogin,  offerController.loadOffers)
adminRoute.get('/addOff', isLogin,  offerController.loadAddOffer)
adminRoute.post('/addOfferDB', isLogin,  offerController.addOffers)
adminRoute.get('/deleteOff', isLogin,  offerController.deleteOffer)
//category offers
adminRoute.get('/offersCat', isLogin,  offerController.loadCategoryOffers)
adminRoute.get('/addoffersCat', isLogin, offerController.loadAddCategoryOffer)
adminRoute.post('/addOfferCatDB', isLogin, offerController.addCategoryOffer)
adminRoute.get('/deletecatOff', isLogin,  offerController.deleteCategoryOffer)

//coupon
adminRoute.get('/loadCoupon', isLogin,  couponController.loadCoupon)
adminRoute.get('/loadAddCoupon', isLogin,  couponController.loadAddCoupon)
adminRoute.post('/addCouponDB', isLogin, couponController.addCoupon)
adminRoute.get('/loadEditCoupon', isLogin,  couponController.loadEditCoupon)
adminRoute.post('/editCouponDB', isLogin, couponController.editCoupon);
adminRoute.get('/deleteCoupon', isLogin, couponController.deleteCoupon);


module.exports = adminRoute