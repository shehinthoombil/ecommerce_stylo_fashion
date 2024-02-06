const { log } = require('console');
const Coupon = require('../model/couponModel')
const Cart = require('../model/cartModel')
const User = require('../model/userModel')


//load coupon management 
const loadCoupon = async (req, res)=> {
    try {
        const coupon = await Coupon.find({})
        console.log(coupon,'coupon vannu')
        res.render('admin/couponManagement' , { coupon })
    } catch (error) {
        console.log(error.message);
    }
}

//load add coupon to database
const loadAddCoupon = async (req, res) => {
    try {
        res.render('admin/addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

// add coupon to database
const addCoupon = async (req,res) => {
    try {
        
        const data = new Coupon({
            couponname: req.body.couponname,
            couponcode: req.body.couponcode,
            discountamount: req.body.discountamount,
            activationdate: req.body.activationdate,
            expirydate: req.body.expirydate,
            criteriaamount: req.body.criteriaamount,
            userslimit: req.body.userslimit,
            description: req.body.description,
            status: 'active',
        })
        await data.save()
        console.log(data);
        res.redirect('loadCoupon')

    } catch (error) {
        console.log(error.message);
    }
}


//load edit coupon
const loadEditCoupon = async (req, res) => {
    console.log(loadEditCoupon,'editcoupon');
    try {
        const coupon = await Coupon.findOne({ _id: req.query.id })

        res.render('admin/editCoupon', { coupon })
    }
    catch (error) {
        console.log(error.message)
        res.render('500')
    }
}


//edit coupon to DB
const editCoupon = async (req,res) => {
    try {
        const id = req.query.id

        await Coupon.updateOne({ _id: id }, {
            $set: {
                couponname: req.body.couponname,
                couponcode: req.body.couponcode,
                discountamount: req.body.discountamount,
                activationdate: req.body.activationdate,
                expirydate: req.body.expirydate,
                criteriaamount: req.body.criteriaamount,
                userslimit: req.body.userslimit,
                description: req.body.description
            }
        })
        res.redirect('/admin/loadCoupon')

    } catch (error) {
        console.log(error.message);
    }
}

//delete coupon from database
const deleteCoupon = async (req, res) => {
    try {

        await Coupon.deleteOne({ _id: req.query.id })
        res.redirect('/admin/loadCoupon');

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


//calculate discount on coupon 
const calculateDiscountedTotal = (total, discountAmount) => {
    // Your discount calculation logic here
    return total - discountAmount;
}; 

//apply coupon
const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.session.user_id;

        const currentDate = new Date();

        const coupon = await Coupon.findOne({ couponcode: couponCode });
        console.log(coupon, 'coupon vannu');
        if (!coupon) {
            return res.json({ success: false, message: 'Invalid coupon code' });
        }
       
        if (!userId) {
            return res.json({ success: false, message: 'User not found' });
        }
      
        // Check activation date
        if (currentDate < coupon.activationdate) {
            return res.json({ success: false, message: 'Coupon is not yet active' });
        }
    
        // Check expiry date
        if (currentDate > coupon.expirydate) {
            return res.json({ success: false, message: 'Coupon has expired' });
        }
      
        // criteria of amount
        const cart = await Cart.findOne({ userid: userId });
        if (!cart) {
            return res.json({ success: false, message: 'User cart not found' });
        }
     
        if (cart.total < coupon.criteriaamount) {
            return res.json({ success: false, message: 'Order total does not meet coupon criteria amount' });
        }
      
        // Update the cart with the discounted total
        const discountedTotal = calculateDiscountedTotal(cart.total, coupon.discountamount);
        await Cart.updateOne({ userid: userId }, { $set: { total: discountedTotal } });

        // Send the updated total back to the client
        return res.status(200).json({
            success: true, message: 'Coupon applied successfully!', discountedTotal,
            couponDiscountAmount: coupon.discountamount,
        });
    } catch (error) {
        console.error(error.message);
        res.render('500')
    }
};



module.exports = {
    loadCoupon,
    loadAddCoupon,
    addCoupon,
    loadEditCoupon,
    editCoupon,
    deleteCoupon,
    applyCoupon,

}