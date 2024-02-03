const { log } = require('console');
const Coupon = require('../model/couponModel')


//load coupon management 
const loadCoupon = async (req, res)=> {
    try {
        const coupon = await Coupon.find({})
        res.render('admin/couponManagement' , { coupon })
    } catch (error) {
        console.log(error.message);
    }
}

//load add coupon
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
        res.redirect('admin/loadCoupon')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCoupon,
    loadAddCoupon,
    addCoupon,
}