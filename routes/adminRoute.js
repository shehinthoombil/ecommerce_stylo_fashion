const express = require("express");
const adminRoute = express();
const adminController = require('../controller/adminController')
const offerController = require('../controller/offerController')
const imageUpload = require('../middlewares/imgUploads')

const session = require("express-session");
const path = require("path")
const config = require("../config/config");
adminRoute.set('view engine', 'ejs')

adminRoute.use(session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: true,
}));

adminRoute.get('/', adminController.loadLogin)
adminRoute.post('/', adminController.adminVerify)
adminRoute.get('/dashboard', adminController.loadDashboard)
adminRoute.get('/adminlogout', adminController.logoutAdmin)
adminRoute.get('/userManagement', adminController.loadUserManagement)
adminRoute.get('/block-user', adminController.blockUser)
//categories
adminRoute.get('/category/categories', adminController.loadCategories)
adminRoute.get('/category/addCategory', adminController.loadAddCategories)
adminRoute.get('/category/editCategory', adminController.loadEditCategories)
adminRoute.post('/categories', imageUpload.uploadCategoryImage, imageUpload.resizeCategoryImage, adminController.addCategory)
adminRoute.post('/category/editCategory', imageUpload.uploadCategoryImage, imageUpload.resizeCategoryImage, adminController.editCategory)

//products
adminRoute.get('/product/products', adminController.loadProducts)
adminRoute.get('/product/addProduct', adminController.loadAddProduct)
adminRoute.get('/product/editproduct', adminController.loadEditproduct)
adminRoute.post('/product/editProduct', imageUpload.uploadProductImages, imageUpload.resizeProductImages, adminController.editProduct)
adminRoute.post('/product/addProduct', imageUpload.uploadProductImages, imageUpload.resizeProductImages, adminController.addProduct)
adminRoute.get('/block-pro', adminController.listUnlistProduct)
adminRoute.delete('/deleteExistImage', adminController.deleteExistImage);

//orders
adminRoute.get('/orderManagement', adminController.loadOrder);
adminRoute.post('/updateOrderStatus', adminController.updateOrderStatus);

//filter chart
adminRoute.get('/chartWeek', adminController.chartFilterWeek);
adminRoute.get('/chartMonth', adminController.chartFilterMonth);
adminRoute.get('/chartYear', adminController.chartFilterYear);

//sales
adminRoute.get('/salesSummary', adminController.loadSalesSummary);
adminRoute.get('/sales',adminController.filterSaleYear)

//product offers
adminRoute.get('/offers', offerController.loadOffers)
adminRoute.get('/addOff', offerController.loadAddOffer)
adminRoute.post('/addOfferDB', offerController.addOffers)
adminRoute.get('/deleteOff', offerController.deleteOffer)
//category offers
adminRoute.get('/offersCat', offerController.loadCategoryOffers)
adminRoute.get('/addoffersCat', offerController.loadAddCategoryOffer)

module.exports = adminRoute