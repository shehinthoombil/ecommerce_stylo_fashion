const User = require('../model/userModel')
const Address = require('../model/addressModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');

// load myAccount dasboard 
const loadMyAccount = async (req, res) => {
    try {
        let userName;
        let UserAddress;
        let userDB
        let addressId = req.query.id;
        if (req.session.user_id) {
            const user = await User.findOne({ _id: req.session.user_id });
            const addresses = await Address.find({ User: req.session.user_id });

            if (user) {
                userName = user.name;
                UserAddress = addresses;
                userDB = user
                return res.render('account', { UserAddress, userName ,userDB});
              }
        }
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal Server Error');
    }
}

//load edit Address
const loadEditaddress = async (req, res) => {
    try {
        let userName;
        // Initialize userAdd as an empty array
        let userAdd = [];
        const addressid = req.query.id
        console.log(addressid);
        if (req.session.user_id) {
          const user = await User.findOne({ _id: req.session.user_id });
          const UserAddress = await Address.findOne({ _id: addressid });
    
    
          if (user) {
            userName = user.name;
            if (UserAddress) {
              userAdd = UserAddress.address; // Set userAdd to the address data if available
            }
          }
        }
    
        res.render('editAddress', { userName, userAdd });
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

// load add Address
const loadAddAddress = async (req,res) => {
    try {
        let userName 
        if (req.session.user_id) {
            const user = await User.findOne({ _id:req.session.user_id });
            console.log(user);
            if (user) {
                userName = user.name;
                return res.render('addAddress', { userName });
              }  
        }
        else {
            res.render('addAddress', { userName });
        }
    } catch (error) {
        console.log(error.message);
    res.render('500')
    }
}

//add address to db

const addAddress = async (req, res) => {

    try {
      let userId
      if (req.session.user_id) {
        const user = await User.findOne({ _id: req.session.user_id });
        userId = user._id
        console.log(userId);
        const addressData = {
          userId: user._id,
          address: {
            fullname: req.body.fullname,
            mobile: req.body.mobile,
            email: req.body.email,
            houseNo: req.body.houseNo,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.zipcode,
            additionalDetails: req.body.additionalDetails,
          },
        };
        const newAddress = new Address(addressData);
  
        await newAddress.save();
        res.redirect('/myAccount');
      }
    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  }
  
  //edit address in db

  const editAddress = async (req, res) => {
    try {
      const id = req.query.id;
  
      // Create an object with the fields to update
      const updateFields = {
        "address.$.fullname": req.body.fullname,
        "address.$.mobile": req.body.mobile,
        "address.$.email": req.body.email,
        "address.$.houseNo": req.body.houseNo,
        "address.$.city": req.body.city,
        "address.$.state": req.body.state,
        "address.$.zipcode": req.body.zipcode,
        "address.$.additionalDetails": req.body.additionalDetails,
      };
  
      // Use updateOne to update the specified subdocument in the array
      const updatedAddress = await Address.updateOne(
        { "address._id": id },
        { $set: updateFields }
      );
      console.log(updateFields);
      console.log(updatedAddress);
  
  
      res.redirect('/myAccount');
  
    } catch (error) {
      console.error(error.message);
      res.render('editAddress', { message: 'An error occurred' });
    }
  };

  const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 8)
        console.log(passwordHash);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

  const userDetails = async(req,res) =>{
    try {
        const hashedPassword = await securePassword(req.body.confirmPassword);
        let newDetails = {
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:hashedPassword
           
        }
        const newDB = await User.updateOne({ _id: req.session.user_id }, { $set: newDetails });
        console.log(newDB);
        res.redirect('/myAccount')
    } catch (error) {
        console.log(error.message)
    }
  }
module.exports = {
    loadMyAccount,
    loadEditaddress,
    loadAddAddress,
    addAddress,
    editAddress,
    userDetails
};