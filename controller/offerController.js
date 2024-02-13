const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const Offers = require('../model/productOfferModel')
const CategoryOffer = require('../model/categoryOfferModel')



// load product offer management
const loadOffers = async (req,res) => {
    
    try {
        const offerDB = await Offers.find({}).lean();
        res.render('admin/productOfferManagement' , { offerDB })
    } catch (error) {
        console.log(error.message);
    }
}

// load add offer page on products
const loadAddOffer = async (req, res) => {
    try {
        const product = await Product.find({ is_deleted:false })
        console.log(product,'product offerkk keri');
        
        res.render('admin/addOffer' , { product })

    } catch (error) {
        console.log(error.message);
    }
}

//add offers on products

const addOffers = async (req, res) => {
    try {
        const productData = await Product.findOne({ name: req.body.product });
        console.log(productData, 'productdatakitti offernn');
        
        if(!productData) {
            // console.log('Product not found');
            return res.redirect('/admin/offers');
        }
        const percent = req.body.percentage
        const newOffer = new Offers({
            product: productData._id,
            productname: req.body.product,
            percentage: percent,
            expiryDate: req.body.EndingDate,
        });
        // console.log(newOffer, 'newone');

        await newOffer.save();
        const productDB = await Product.findOne({ _id: productData._id })
        // console.log(productDB);

        const offerPrice = Math.floor((productDB.price * percent) / 100);
        const updateProductPrice = await Product.updateOne({ _id: productData._id }, { $set: { discountPricepro: productDB.price - offerPrice } })
        // console.log(updateProductPrice);
        // console.log('Offer added successfully');

        res.redirect('/admin/offers');
       
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/offers');
    }
}

//delete offer on product

const deleteOffer = async (req, res) => {
    try {
        const currentData = await Offers.findOne({ _id: req.query.id });

        if (!currentData) {
            return res.status(404).send('Offers not found');
        }

         // Check if the offer is expired
         if (currentData.expiryDate < new Date()) {
            console.log('Offer is expired');
        } else {
            // If the offer is not expired, update the product's discountPricepro
            const productDB = await Product.findOne({ _id: currentData.product });

            if (productDB) {
                console.log('Offer is not expired');
                // Set the discountPricepro to null
                productDB.discountPricepro = null;
                await productDB.save();
            }
        }
         // Delete the offer
         await Offers.deleteOne({ _id: req.query.id });

         res.redirect('/admin/offers');

    } catch (error) {
        console.log(error.message);
    }
}

// load category offer management

const loadCategoryOffers = async (req,res) => {
    try {
        const categoryOffers = await CategoryOffer.find({}).lean() // lean for populate
        res.render('admin/categoryOfferManagement' , { categoryOffers})
    } catch (error) {
        console.log(error.message)
        res.render('admin/categoryOfferManagement', { categoryOffers: [] });
    }
}
// load add offer page on categories

const loadAddCategoryOffer = async (req,res)=> {
    try {
        const categories = await Category.find()
        res.render('admin/addCategoryOffer' , { categories })
    } catch (error) {
        console.log(error.message);
    }
}

//add offers on category
const addCategoryOffer = async (req, res) => {
    try {
        // Find the category based on the provided name
        const categoryData = await Category.findOne({ name: req.body.categories });
        if (!categoryData) {
            console.log('Category not found');
            return res.redirect('/admin/offersCat');
        }

        // Extract the percentage discount from the request body
        const percent = req.body.percentage;

        // Create a new CategoryOffer document
        const newCategoryOffer = new CategoryOffer({
            categoryname: req.body.categories,
            category: categoryData._id,
            percentage: percent,
            expiryDate: req.body.EndingDate,
        });

        // Save the new CategoryOffer to the database
        await newCategoryOffer.save();

        // Find all products in the specified category
        const productsInCategory = await Product.find({ category: req.body.categories });

        // Update the discounted price for each product in the category
        for (const product of productsInCategory) {
            // Calculate the discounted price for the current product
            const offerPrice = Math.floor(product.price - (product.price * percent / 100));

            // Update the product's discounted price in the database
            await Product.updateOne({ _id: product._id }, { $set: { discountPricecat: offerPrice } });
        }

        console.log('Category Offer added successfully');

        res.redirect('/admin/offersCat');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//delete category offer

const deleteCategoryOffer = async (req, res) => {
    try {
        
        const currentData = await CategoryOffer.findOne({ _id: req.query.id });

        const productDB = await Product.find({ category: currentData.categoryname });

        console.log(productDB);

        if (productDB.length > 0) {
            console.log('Offer is not expired');

            // Iterate through each product and update the discountPricecat field
            for (const product of productDB) {
                if (product.discountPricecat) {
                    // Delete the field
                    product.discountPricecat = null

                    // Save the updated document
                    await product.save();
                    console.log(product);
                }
            }
        }


        await CategoryOffer.deleteOne({ _id: req.query.id });

        res.redirect('/admin/offersCat');
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
};

module.exports = {
    loadOffers,
    loadAddOffer,
    addOffers,
    deleteOffer,
    loadCategoryOffers,
    loadAddCategoryOffer, 
    addCategoryOffer,
    deleteCategoryOffer,

}