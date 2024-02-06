const Admin = require("../model/adminModel")
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const Product = require('../model/productModel');
const Offers = require('../model/productOfferModel');
const CategoryOffer = require('../model/categoryOfferModel');
const Order = require('../model/orderModel')
const Address = require('../model/addressModel')
const path = require('path');
const { log } = require("console");
const { name } = require("ejs");
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const zip =  require('express-zip');



//load login
const loadLogin = async (req, res) => {
    try {
        res.render('admin/signIn');
    } catch (error) {
        console.log(error.message);
    }
};
const loadDashboard = async (req, res) => {
    try {
        const newProduct = await Product.find({}).sort({ _id: -1 }).limit(1)

        const orderCount = await Order.countDocuments();
        const userCount = await User.countDocuments();
        // Fetch total revenue
        const totalRevenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ])

        let totalCod = await Order.aggregate([
            { $match: { status: 'Delivered', paymentMethod: 'cod' } },

            { $group: { _id: null, total1: { $sum: 1 } } }
        ])

        let totalOnline = await Order.aggregate([
            { $match: { status: 'Delivered', paymentMethod: 'online' } },

            { $group: { _id: null, total2: { $sum: 1 } } }
        ])

        totalCod = totalCod.length > 0 ? totalCod[0].total1 : 0;
        totalOnline = totalOnline.length > 0 ? totalOnline[0].total2 : 0;
        

        const formattedTotalRevenue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;
        if (newProduct.length > 0) {
            res.render('admin/dashboard', { totalRevenue: formattedTotalRevenue, orderCount, userCount, totalCod, totalOnline, newProduct });
        } else {
            res.render('admin/dashboard', { totalRevenue: formattedTotalRevenue, orderCount, userCount, totalCod, totalOnline, newProduct: {} });
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
};

// dashboard chart filter(weekly)

const chartFilterWeek = async (req,res) => {
    try {
        const totalCodWeek = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'cod',
            purchaseDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        });

        const totalOnlineWeek = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'online',
            purchaseDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        });

        res.json([totalCodWeek , totalOnlineWeek]);

    } catch (error) {
        console.log(error.message)
    }
}

// dashboard chart filter(monthly)

const chartFilterMonth = async (req,res) => {
    try {
        const totalCodMonth = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'cod',
            purchaseDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        });

        const totalOnlineMonth = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'online',
            purchaseDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        });
        res.json([totalCodMonth , totalOnlineMonth]);

    } catch (error) {
        console.log(error.message);
    }
}

// dashboard chart filter(yearly)

const chartFilterYear = async (req,res) => {
    try {
        const totalCodYear = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'cod',
            purchaseDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        });

        const totalOnlineYear = await Order.countDocuments({
            status: 'Delivered',
            paymentMethod: 'online',
            purchaseDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        });
        res.json([totalCodYear , totalOnlineYear]);
    } catch (error) {
        console.log(error.message);
    }
}

//category management
const loadCategories = async (req, res) => {
    try {
        const categories = await Category.find() //fetch categories from database
        res.render('admin/category/categories', { categories }); // passing categoryData
    } catch (error) {
        console.log(error.message);
    }
};

// load add category page
const loadAddCategories = async (req, res) => {
    try {
        res.render('admin/category/addCategory');
    } catch (error) {
        console.log(error.message);
    }
}


// load page of edit categories
const loadEditCategories = async (req, res) => {
    try {
        const foundCategory = await Category.findById(req.query.id);
        res.render('admin/category/editCategory', { foundCategory });
    } catch (error) {
        console.log(error.message);
    }
}

// adding category 

const addCategory = async (req, res) => {
    const { name, description, photo } = req.body;
    console.log(req.body);

    try {
        const existCategory = await Category.findOne({ name: req.body.name });

        if (existCategory) {
            return res.render('admin/category/addCategory', { status: 'failed', message: "Category already Exists" });
        }

        const newCategory = await Category.create({
            name,
            description,
            image: photo
        });

        await newCategory.save();
        res.redirect('/admin/category/categories');
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, maybe render an error page
        res.status(500).send('Internal Server Error');
    }
};

// edit category
const editCategory = async (req, res) => {
    const { id, name, description, photo } = req.body;
    console.log(req.body);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, {
            name,
            description,
            image: photo
        }, { new: true }); // { new: true } returns the modified document rather than the original

        if (!updatedCategory) {
            // Handle the case where the category with the given ID is not found
            console.log('Category not found');
        }
        await res.redirect('/admin/category/categories')
    } catch (error) {
        console.log(error.message);

    }
}


//verify admin and  load dashboard of admin
const adminVerify = async (req, res) => {
    try {
        const { email, password } = req.body

        const admin = await Admin.findOne({ email });

        if (admin) {
            if (password === admin.password) {
                res.redirect('/admin/dashboard')
            }
        } else {
            res.render('admin/signIn', { message: "Email and password are incorrect." })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//logout in admin home 

const logoutAdmin = async (req, res) => {
    try {
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

// load usermangment

const loadUserManagement = async (req, res) => {
    try {
        const Userdb = await User.find({})
        res.render('admin/userManagement', { user: Userdb })
    } catch (error) {
        console.log(error.message)
    }
}

// block user or unblock user

const blockUser = async (req, res) => {
    try {
        const blocked = await User.findOne({ _id: req.query.id })
        if (blocked.is_block == 0) {
            await User.updateOne({ _id: req.query.id }, { $set: { is_block: 1 } })
            req.session.user_id = false;
            console.log('User session Cleared:', req.session.user_id, 'logout successfull');
            res.redirect('/admin/userManagement')
        } else {
            await User.updateOne({ _id: req.query.id }, { $set: { is_block: 0 } })
            req.session.user_id = true;
            res.redirect('/admin/userManagement')
        }

    } catch (error) {
        console.log(error.message);
    }
}

//category management
const loadProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.render('admin/product/products', { products });
    } catch (error) {
        console.log(error.message);
    }
};

const listUnlistProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.query.id);
        const todo = !product.is_deleted;
        product.is_deleted = todo;
        await product.save();
        res.redirect('/admin/product/products')
    } catch (error) {
        console.log(error.message);
    }
};

// add product page
const loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ is_deleted: false }).select('name');
        res.render('admin/product/addProduct', { categories });
    } catch (error) {
        console.log(error.message);
    }
}

//adding products
const addProduct = async (req, res) => {
    try {
        const { name, category, quantity, price, photos } = req.body;
        console.log(category);
        // Create a new product instance
        const newProduct = new Product({
            name,
            category,
            quantity,
            price,
            images: photos,
        });
        // Save the product to the database
        await newProduct.save();

        res.redirect('/admin/product/products')
    } catch (error) {
        console.log(error.message);
    }
};

// load page of edit product
const loadEditproduct = async (req, res) => {
    try {
        const foundProduct = await Product.findById(req.query.id);
        const categories = await Category.find({ is_deleted: false }).select('name');
        res.render('admin/product/editProduct', { foundProduct, categories });
    } catch (error) {
        console.log(error.message);
    }
}

// edit product
const editProduct = async (req, res) => {
    console.log(req.body);
    const { id, name, category, price, quantity, photos } = req.body;

    try {
        const updatedCategory = await Product.findByIdAndUpdate(id, {
            name,
            quantity,
            price,
            category,
            images: photos
        }, { new: true }); // { new: true } returns the modified document rather than the original

        if (!updatedCategory) {
            // Handle the case where the category with the given ID is not found
            console.log('Category not found');
        }
        await res.redirect('/admin/product/products')
    } catch (error) {
        console.log(error.message);

    }
}

// delete Existing image from edit product

const deleteExistImage = async (req, res) => {
    try {
        console.log('334');

        const productid = req.body.productid
        const imageid = req.body.imageid
        console.log(productid + "    " + imageid);
        const productimage = await Product.updateOne({ _id: productid }, { $pull: { images: imageid } })
        if (productimage) {
            res.json({ result: true })
        }
        else {
            res.json({ result: false })
        }
        console.log(productimage);
    } catch (error) {
        console.error('Error deleting image:', error);
        res.render('500')
    }
}

//load order page

const loadOrder = async (req, res) => {
    try {
        const orderDat = await Order.find({})
            .populate({
                path: 'userId',
                select: 'name'
            })
            .populate('products.product')
            .sort({ purchaseDate: -1 });



        if (orderDat) {
            res.render('admin/orderManagement', { orderDat })
        } else {
            res.render('admin/orderManagement', { orderDat: {} })
        }
    } catch (error) {
        console.log(error.message);
    }
}

// updating order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        console.log("here");
        const orderStatus = await Order.updateOne({ _id: orderId }, { status: newStatus });
        console.log(orderStatus);
    } catch (error) {
        console.log(error.mesaage);
    }
}

// load sales summary page 

const loadSalesSummary = async (req, res) => {
    console.log(loadSalesSummary,'summary keriikntta..');
    try {
       const orderDat = await Order.find({})
       .populate({
        path:'userId',
        select: 'name'
       }) 
       .populate('products.product')
       console.log(orderDat[0].products)
       const newProduct = await Product.find({})
       res.render('admin/salesSummary' , { orderDat, newProduct })
    } catch (error) {
        console.log(error.message);
    }
}

// filter sale and download report

const filterSaleYear = async (req,res) => {
    console.log(filterSaleYear , 'filtereport kerri' )
    try {
        let filter = {};
        console.log(filter ,'filterikk vechu' );

    if (req.query.filter) {
      const filterType = req.query.filter;
      console.log(filterType ,'filtertype vechu' );

      switch (filterType) {
        case 'week':
          filter = {
            purchaseDate: {
              $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
            },
          };
          break;

        case 'month':
          filter = {
            purchaseDate: {
              $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
            },
          };
          break;

        case 'year':
          filter = {
            purchaseDate: {
              $gte: new Date(new Date() - 365 * 24 * 60 * 60 * 1000),
            },
          };
          break;

        case 'custom':
          if (req.query.fromDate && req.query.toDate) {
            filter = {
              purchaseDate: {
                $gte: new Date(req.query.fromDate),
                $lte: new Date(req.query.toDate),
              },
            };
          }
          break;

        default:
          break;
      }
    }

    const orderDat = await Order.find(filter)
      .populate({
        path: 'userId',
        select: 'name',
      })
      .populate('products.product');
    

    // console.log(orderDat.products , 'orderdata products kitti')
    // console.log(orderDat ,'orderdatas');
    //  console.log(orderDat[0].products , 'orderdata products kitti2')

    // Generate Excel
    const excelPath = path.join(__dirname, 'downloads', 'sales_report.xlsx');
    console.log(excelPath);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    console.log("1");
    // Add headers
    worksheet.addRow(['Order Date', 'Product Name', 'Quantity', 'Price', 'Total Price']);
    console.log("2");
    // Add data
    const ord = orderDat.forEach((order) => {
        
      order.products.forEach((product) => {
          console.log(product.product.name);
          worksheet.addRow([
          order.purchaseDate.toLocaleString('en-US'),
          product.product.name,
          product.product.quantity,
          `$${product.product.price.toFixed(2)}`,
          `$${(product.product.quantity * product.product.price).toFixed(2)}`,
        ]);
      });
    });
    console.log(ord+"1111");
    const excelPromise = workbook.xlsx.writeFile(excelPath)
      .then(() => excelPath)
      .catch((err) => {
        console.log(err);
        throw new Error('Error generating Excel');
      });
      
    // Wait for the promise to resolve
    try {
      const excelPath = await excelPromise;
      console.log("4");
      // Send the Excel file using express-zip
      res.zip([{ path: excelPath, name: 'sales_report.xlsx' }]);
    } catch (error) {
      console.log(error);
    //   res.render('500');
    }

    } catch (error) {
     console.log(error.mesaage);   
    //  res.render('500'); 
    }
}

module.exports = {
    loadLogin,
    adminVerify,
    loadDashboard,
    chartFilterWeek,
    chartFilterMonth,
    chartFilterYear,
    logoutAdmin,
    loadUserManagement,
    blockUser,
    loadCategories,
    loadAddCategories,
    addCategory,
    editCategory,
    loadEditCategories,
    loadProducts,
    loadAddProduct,
    addProduct,
    loadEditproduct,
    editProduct,
    listUnlistProduct,
    deleteExistImage,
    loadOrder,
    updateOrderStatus,
    loadSalesSummary,
    filterSaleYear,
}
