const Admin = require("../model/adminModel")
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const Product = require('../model/productModel');
const { log } = require("console");


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
        res.render('admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
};

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
      console.log(productid+"    "+imageid);
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


module.exports = {
    loadLogin,
    adminVerify,
    loadDashboard,
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
}
