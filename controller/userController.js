const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const { env } = require('process');
const randomString = require("randomstring");
const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const Offers = require('../model/productOfferModel');
const CategoryOffer = require('../model/categoryOfferModel');
const Wishlist = require('../model/wishlistModel')
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
        } else {
            res.render('home', { user });
        }



    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., send an error response
        res.status(500).send('Internal Server Error');
    }
};

//referal code generator

function generateReferalCode() {

    const Rcode = randomString.generate({
        length: 8
    })
    return User.findOne({ referalCode: Rcode })
        .then(existingRefer => {
            if (existingRefer) {
                return generateCouponCode();// If the code is not unique, generate a new one recursively
            }
            return Rcode; // Return the unique code
        });
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

        //referal code seting new user
        const myReferCode = await generateReferalCode()
        console.log(myReferCode, "referral vannallo...")

        const user = new User({
            name: req.body.newUsername,
            email: req.body.newEmail,
            mobile: req.body.newMobile,
            password: spassword,
            referalCode: myReferCode,
            is_verified: 0,
            is_block: 0,
        })
        const userData = await user.save()
        console.log(userData);


        if (req.body.referalCode) {
            console.log(req.body.referalCode , 'referalcode varunnu')

            const referedUser = await User.findOne({ referalCode: req.body.referalCode })
            if (referedUser) {
                const wHistory = {
                    date: Date.now(),
                    amount: 200,
                    message: 'Invitation bonus via referal code'
                }
                referedUser.wallet += 200
                referedUser.walletHistory.push(wHistory)
                await referedUser.save()
                console.log(referedUser);

                const W_history = {
                    date: Date.now(),
                    amount: 100,
                    message: 'referal bonus'
                }
                user.wallet += 100
                user.walletHistory.push(W_history)
                await user.save()
            }

        }




        // OTP 
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
    console.log('verify login success')

    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log(passwordMatch);
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


        const availableCategories = await Category.find()
        // console.log(availableCategories , 'categories und');
        const discount = await Offers.find({})
        const discountcategory = await CategoryOffer.find({});
        const productData = await Product.find({});
        const renderData = { products: productData, discPrice: discount, discCat: discountcategory, availableCategories };

        console.log(renderData.discPrice);
        res.render('productList', {
            // products: productData, 
            // discPrice: discount,
            //  discCat: discountcategory, 
            //  availableCategories,
            ProductDB,
            categories,
            totalPages: Math.ceil(count / limit),  //Ex:- count of document/limit (9/6 = 1.5 => 2)
            currentPage: page,  //page 1
            title: 'productList',
            renderData,
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

        const discount = await Offers.find({})
        const discountcategory = await CategoryOffer.find({});


        res.render('productDetails', { productDB, discPrice: discount, discCat: discountcategory })
    } catch (error) {
        console.log(error.message);
        res.render('500')
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
                    console.log(hasCart,'hascart aan');
                    res.render('cart', { cartItems: hasCart, totalSum, datatotal });
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

// const addToCart = async (req, res) => {
//     try {
//         console.log("product cartilkk add aayi");
//         const { productId } = req.body;
//         const userId = req.session.user_id;

//         // Retrieve user and product details
//         const user = await User.findById(userId);
//         const productDetails = await Product.findById(productId);

//         const product = {
//             productId,
//             // sum: productDetails.price, // No need to multiply by 1
//             // price: productDetails.price
//             sum: productDetails.discountPricepro || productDetails.price,
//             price: productDetails.discountPricepro || productDetails.price
//         };

//         const hasCart = await Cart.findOne({ userId });

//         if (hasCart) {
//             // Add product to existing cart
//              hasCart.products.push(product);
//             await hasCart.save();
//         } else {
//             console.log("hascart cart vechu");
//             const discountPrices = [productDetails.discountPricepro, productDetails.price, productDetails.discountPricecat];
//             const validDiscounts = discountPrices.filter(discount => discount !== null && discount !== undefined);

//             let smallestDiscount = validDiscounts ? Math.min(...validDiscounts) : undefined;
//             console.log(smallestDiscount + "Smallest discount");
//             const cartItem = {
//               productId: productId,
//               count: 1,
//               price: smallestDiscount ? smallestDiscount : productDetails.price,
//             };
//             console.log('cartitems discount');

//             // // Create a new cart if it doesn't exist
//             // const newCartItem = new Cart({
//             //     userId,
//             //     userName: user.name,
//             //     products: [product],

//             // });
//             // const newData = await newCartItem.save();
//             const newCart = await Cart.findOneAndUpdate(
//                 { userId: userId },
//                 { $set: { userId: userId }, $push: { products: cartItem } },
//                 { upsert: true, new: true }
//               );

//             console.log(newCart , 'new cart items');

//         }
//         console.log("+++++++++++++++++++++++++++++");

//         // After updating the cart, redirect or render the view
//         res.redirect('/productList');
//     } catch (error) {
//         console.error(error.message);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;

        // Retrieve user and product details
        const user = await User.findById(userId);
        const productDetails = await Product.findById(productId);

        const hasCart = await Cart.findOne({ userId });

        if (hasCart) {
            // Check if the product already exists in the cart
            const existingProductIndex = hasCart.products.findIndex(item => item.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                // If the product already exists, increment its quantity
                hasCart.products[existingProductIndex].count += 1;
            } else {
                const discountPrices = [productDetails.discountPricepro, productDetails.price, productDetails.discountPricecat];
                const validDiscounts = discountPrices.filter(discount => discount !== null && discount !== undefined);
                let smallestDiscount = validDiscounts ? Math.min(...validDiscounts) : undefined;
                // If the product doesn't exist, add it to the cart
                hasCart.products.push({
                    productId: productId,
                    count: 1,
                    // sum: productDetails.discountPricepro || productDetails.price,
                    price: smallestDiscount ? smallestDiscount : productDetails.price,
                });
            }
            await hasCart.save();

        } else {
            // If the user doesn't have a cart, create a new one and add the product
            const cartItem = {
                productId: productId,
                count: 1,
                price: productDetails.discountPricepro || productDetails.price
            };
            const newCart = new Cart({
                userId: userId,
                products: [cartItem]
            });
            await newCart.save();
        }

        // Redirect or render the view after updating the cart
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

//load wishlist page

const loadWishlist = async (req, res) => {
    try {

        const user = req.session.user_id;
        let userName;
        let wishlist
        if (user) {
            const userData = await User.findOne({ _id: user });

            if (!userData) {
                console.log('User not found');
                return res.status(404).render('error', { errorMessage: 'User not found' });
            }

            userName = userData.name;

            wishlist = await Wishlist.find({ userId: user }).populate('productid');

            res.render('wishlist', { wishlist, userName });
        } else {
            console.log('User not authenticated');
            res.render('wishlist', { wishlist: wishlist || [], userName });
        }

    } catch (error) {
        console.error(error.message);

        res.render('500')
    }
}

// add product to whishlist

const addtoWishlist = async (req, res) => {
    console.log('wishkkkerri')
    try {
        const user = req.session.user_id;
        console.log(user, " userW");
        const pro_id = req.body.id;
        const wishlist = await Wishlist.findOne({ userId: user });
        console.log(wishlist, 'wishlistdb');
        const checkwishlistdata = await Wishlist.findOne({ userId: user, productid: pro_id });
        console.log(checkwishlistdata, 'datas');

        if (user) {
            if (wishlist) {
                if (checkwishlistdata) {
                    res.json({ result: false });
                } else {
                    await Wishlist.updateOne({ userId: user }, { $push: { productid: pro_id } });
                    res.json({ result: true });
                }
            } else {
                const data = new Wishlist({
                    userId: user,
                    productid: [pro_id],
                });

                await data.save();
                res.json({ result: true });
            }
        } else {
            res.json({ result: false });
        }

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//delete ishlist product

const deleteWishproduct = async (req, res) => {
    console.log('delete wish');
    try {
        const user = req.session.user_id;
        const pro_id = req.query.id;
        console.log(user, 'usernd');
        console.log(pro_id, 'product ind');
        await Wishlist.updateOne({ userId: user }, { $pull: { productid: pro_id } });
        res.redirect('/wishlist')

    } catch (error) {
        console.log(error.message)
        res.render('500')
    }
}

//load contactUs page

const loadContactUs = async (req, res) => {
    try {
        res.render('contactUs')
    } catch (error) {
        console.log(error.message);
    }
}







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
    loadWishlist,
    addtoWishlist,
    deleteWishproduct,
    loadContactUs,
}