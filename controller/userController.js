const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const { env } = require('process');
const randormstring = require("randomstring");
const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const mongoose = require('mongoose');
const { log } = require('console');

// ++++++++++++++++++++++++++++++++++++++adding secure password bcrypt++++++++++++++++++++++++++++++++++++++++++++++

const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 8)
        console.log(passwordHash);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// ++++++++++++++++++++++++++++++++++++++To load the register page & signIn(BOTH IN SAMEPAGE)++++++++++++++++++++++++++++++++++++++++++++++

const loadRegister = async (req, res) => {
    try {

        res.render('register');

    } catch (error) {
        console.log(error.message);
    }
}

//load home page

const loadHome = async (req, res) => {
    try {
        let user 

        const userDB = await User.findOne({ _id: req.session.user_id });

        if (userDB) {
           
            user = userDB.name;
           return res.render('home', { user });
        }else{
            res.render('home', { user });
        }

        

    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., send an error response
        res.status(500).send('Internal Server Error');
    }
};


// inserting or create new user in database

const insertUser = async (req, res) => {
    try {
        console.log(req.body);
        const spassword = await securePassword(req.body.newPassword);
        const userD = await User.findOne({ email: req.body.newEmail })
        if (userD) {
            return res.render('register', { status: 'failed', message: "Email already Exists" })
        }
        if (!spassword) {
            // Handle the case where password hashing fails
            return res.status(500).send("Failed to hash the password");
        }

        const user = new User({
            name: req.body.newUsername,
            email: req.body.newEmail,
            mobile: req.body.newMobile,
            password: spassword,
            is_verified: 0,
            is_block: 0,
        })
        const userData = await user.save()
        console.log(userData);


        if (userData) {
            sendVerifyMail(req.body.newUsername, req.body.newEmail)

            res.render('userOTP', { user: req.body.newEmail })
        }



    } catch (error) {
        console.log(error.message);
    }
}

// sending OTP to  verify email

function otpgenerator() {
    otpsend = Math.floor(100000 + Math.random() * 900000);
    console.log(otpsend);
}

const sendVerifyMail = async (name, email) => {
    try {
        otpgenerator();
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailPassword

            },
        });


        const mailoptions = {
            from: process.env.emailUser,
            to: email,
            subject: 'Sign up Verification',
            html: `<p>Hi ${name},</p><p>Your OTP is: <strong>${otpsend}</strong><br><br><br>regards,<br><b>STYLO<b></p>`,
        };

        const info = await transporter.sendMail(mailoptions);
        console.log('Email has been sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error.message);

    }
};

//resend OTP

const resendOTP = async (req, res) => {
    try {
  
     const otp = await Math.floor(10000 + Math.random() * 90000);
      console.log(otp)
      sendVerifyMail(nameResend, email2, user_id);
      res.render('userOTP', { message: 'A new OTP has been sent to your email.' });

  
    }
  
    catch (error) {
      console.log(error);
      res.render('500')
    }
  }

// email verifying or OTP verify

const verifyMail = async (req, res) => {

    try {
        console.log('current OTP:', otpsend);
        console.log('User entered OTP:', req.body.otp);
        const use = req.body.usermon


        if (req.body.otp == otpsend) {

            const updateInfo = await User.updateOne({ email: use }, { $set: { is_verified: 1 } })

            console.log(updateInfo);
            // res.redirect("/")
            res.render('register', { status: 'success', message: 'Your Account has been created.' });
        } else {
            res.render('userOTP', { user: use, status: 'failed', message: 'Invalid OTP. Please try again.' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// login user rendering to login page

const loginLoad = async (req, res) => {

    try {

        res.render('register');

    } catch (error) {
        console.log(error.message);
    }
}

//verify login in checking email and password

const verifyLogin = async (req, res) => {
    console.log('OTP verify aayittund')

    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('register', { status: 'success', message: "Please verify your email." });
                }
                else if (userData.is_block === 1) {
                    res.render('register', { status: 'failed', message: "Your Account Has Been Blocked!" });

                }
                else {
                    req.session.user_id = userData._id;
                    res.redirect('/');
                }

            }

            else {
                res.render('register', { status: 'failed', message: "Email and password is incorrect" });
            }

        }
        else {
            res.render('register', { status: 'failed', message: "Enter Correct Details" });
        }


    } catch (error) {
        console.log(error.message);

    }
}

//logout user

const logoutUser = async (req, res) => {

    req.session.user_id = false
    res.render('register');
}

//product list or category page or shop
const productList = async (req, res) => {
    try {
        const categories = await Category.find()
        // Search product
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }

        // Pagination in product
        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }

        const limit = 3;

        const ProductDB = await Product.find({
            is_deleted: false,
            $or: [
                { name: { $regex: new RegExp(search, 'i') } },
                { category: { $regex: new RegExp(search, 'i') } },
            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        //count of pages
        const count = await Product.find({
            is_deleted: false,
            $or: [
                { name: { $regex: new RegExp(search, 'i') } },
                { category: { $regex: new RegExp(search, 'i') } },
            ]
        }).countDocuments();

        res.render('productList', {
            ProductDB,
            categories,
            totalPages: Math.ceil(count / limit),  //Ex:- count of document/limit (9/6 = 1.5 => 2)
            currentPage: page,  //page 1
            title: 'productList'
        });

    } catch (error) {
        console.log(error.message);
    }
};

//product details
const productDetails = async (req, res) => {
    try {
        const id = req.query.id
        const productDB = await Product.findOne({ _id: id })
        // console.log(productDB);
        res.render('productDetails', { productDB })
    } catch (error) {
        console.log(error.message);
    }

}


// load cart
const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                const hasCart = await Cart.findOne({ userId: userId }).populate('products.productId');

                if (hasCart && Array.isArray(hasCart.products)) {
                    let totalSum = 0;

                    // Calculate totalSum outside the loop
                    hasCart.products.forEach(product => {
                        product.sum = product.count * product.price;
                        totalSum += product.sum;
                    });
                    let datatotal = hasCart.products.map((products) => {
                        return products.price * products.count;
                      });
                    res.render('cart', { cartItems: hasCart, totalSum,datatotal });
                } else {
                    res.render('cart', { cartItems: [] }); // Render with an empty cart if no products are found
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


// cart
const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;



        // Retrieve user and product details
        const user = await User.findById(userId);
        const productDetails = await Product.findById(productId);



        const product = {
            productId,
            sum: productDetails.price, // No need to multiply by 1
            price: productDetails.price
        };

        const hasCart = await Cart.findOne({ userId });
        console.log(hasCart);
        if (hasCart) {
            // Add product to existing cart
            hasCart.products.push(product);
            await hasCart.save();
        } else {
            // Create a new cart if it doesn't exist
            const newCartItem = new Cart({
                userId,
                userName: user.name,
                products: [product]
            });
            await newCartItem.save();
        }

        // After updating the cart, redirect or render the view
        res.redirect('/productList');
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

//update quantity to cart

const updateCartQuantity = async (req, res) => {
    try {

        // const { productId } = req.body;
        const userId = req.session.user_id;

        //   const userId = req.session.user_id;
        const productId = req.body.id;
        const val = req.body.val;


        const productData = await Product.findOne({ _id: productId });
        console.log(productData, "123");

        if (productData.quantity > 0) {
            const cartData = await Cart.findOne({ userid: userId, "products.productId": productId });
            const currentCount = cartData.products.find(product => product.productId.toString() === productId.toString()).count;


            if (val === 1) {
                console.log("1");
                if (currentCount < productData.quantity) {
                    console.log("i am shehin thoombil");
                    const newCount = await Cart.updateOne(
                        { userId: userId, "products.productId": productId },
                        { $inc: { "products.$.count": 1 } },
                    );                    
                    console.log(newCount + "count onn maathram koodunnu");
                    console.log("Count increased");
                    res.json({ result: true });
                } else {
                    // Display a "stock exceeded" alert
                    res.json({ result: "stock_exceeded" });
                }
            } else if (val === -1) {
                if (currentCount > 1) {
                    await Cart.updateOne(
                        { userid: userId, "products.productId": productId },
                        { $inc: { "products.$.count": -1 } });

                    console.log("Count decreased");
                    res.json({ result: true });
                } else {
                    // Handle the case when the count is already 1
                    res.json({ result: "quantity_below_1" });
                }
            }
        } else {
            // Display SweetAlert if the product is out of stock
            res.json({ result: "out_of_stock" });
        }
    } catch (error) {
        console.error(error.message);
        res.render('500');
    }
};


//removing a product from cart
const removeCartProduct = async (req, res) => {
    try {
        const productId = req.query.id; // Keep this line for GET request
        const userId = req.session.user_id;
        const cartData = await Cart.findOneAndUpdate(
            { userId },
            {
                $pull: {
                    products: { productId: new mongoose.Types.ObjectId(productId) }
                }
            },
            { new: true }
        );

        console.log(productId);
        console.log(cartData);

        if (cartData) {
            res.json({ success: true, message: 'Product removed from the cart.' });
        } else {
            console.log("No matching items found in the cart.");
            res.json({ success: false, message: 'No matching items found in the cart.' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'An error occurred while removing the product from the cart.' });
    }
};







module.exports = {
    loadRegister,
    loadHome,
    insertUser,
    securePassword,
    sendVerifyMail,
    resendOTP,
    verifyMail,
    loginLoad,
    verifyLogin,
    logoutUser,
    productList,
    productDetails,
    loadCart,
    addToCart,
    updateCartQuantity,
    removeCartProduct,
}