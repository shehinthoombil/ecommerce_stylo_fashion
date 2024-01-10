const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const { env } = require('process');
const randormstring = require("randomstring");
const Product = require('../model/productModel')

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
        const userDB = await User.findOne({ _id: req.session.user_id })
        if (user) {
            user = userDB.name
            res.render('home', { user })
        }
        res.render('home', { user })

    } catch (error) {
        console.log(error.message);
    }
}

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

        const limit = 2;

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
        console.log(productDB);
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
                const cart = await Cart.find({ userId: userId }).populate('products.productId');
                console.log(cart[0].products[0].productId)
                if (cart) {
                    res.render('cart', { cartItems: cart });
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

// cart
const addToCart = async (req, res) => {
    const { productId } = req.body
    const userId = req.session.user_id
    const user = await User.findById(userId)
    const productDetails = await Product.findById(productId)
    try {
        const product = {
            productId,
            sum: productDetails.price * 1,
            price: productDetails.price
        }
        const hasCart = await Cart.findOne({ userId })
        if (hasCart) {
            const productDB = await Product.findOne({ _id: productId })
            hasCart.products.push(product)
            await hasCart.save()
            if (hasCart) {
                return res.render('productDetails', { productDB })
            }
        } else {

            const newCartItem = new Cart({
                userId: userId,
                userName: user.name,
            })
            const productDB = await Product.findOne({ _id: productId })
            newCartItem.products.push(product)
            const addedCart = await newCartItem.save()
            if (addedCart) {
                return res.render('productDetails', { productDB })
            }
        }


    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    loadRegister,
    loadHome,
    insertUser,
    securePassword,
    sendVerifyMail,
    verifyMail,
    loginLoad,
    verifyLogin,
    logoutUser,
    productList,
    productDetails,
    loadCart,
    addToCart
}