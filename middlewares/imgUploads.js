const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4 } = require('uuid');
const fs = require('fs'); // Add the fs module for file system operations

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(null, false); // Fix the typo: `err` should be `null`
  }
};

const upload = multer({ storage, fileFilter });

// Create directories if they don't exist
const createDirectories = () => {
  const publicPath = path.join(__dirname, '../public');
  const imagesPath = path.join(publicPath, 'images');
  const categoryPath = path.join(imagesPath, 'category');
  const productsPath = path.join(imagesPath, 'products');

  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath);
  }

  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath);
  }

  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath);
  }

  if (!fs.existsSync(productsPath)) {
    fs.mkdirSync(productsPath);
  }
};

// Create directories before handling the image upload
createDirectories();

// category
exports.uploadCategoryImage = upload.single('photo');

exports.resizeCategoryImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const originalname = 'category-' + v4() + '-' + '.png';
    req.file.originalname = originalname;
    req.body.photo = originalname;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('png')
      .png({ quality: 90 })
      .toFile(path.join(__dirname, '../public/images/category', originalname));

    next();
  } catch (error) {
    console.log(error.message);
  }
};

// product
exports.uploadProductImages = upload.fields([
  {
    name: 'photos',
    maxCount: 3
  }
]);

exports.resizeProductImages = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }
    req.body.photos = [];

    // Iterate over properties of req.files
    for (const fieldName in req.files) {
      if (Object.prototype.hasOwnProperty.call(req.files, fieldName)) {
        // Iterate over array of files for each field
        for (const file of req.files[fieldName]) {
          const originalname = 'product-' + v4() + '-' + '.png';

          await sharp(file.buffer)
            .resize(500, 500)
            .toFormat('png')
            .png({ quality: 90 })
            .toFile(path.join(__dirname, '../public/images/products', originalname));

          req.body.photos.push(originalname);
        }
      }
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
};
