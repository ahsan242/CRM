
// const db = require('../config/db');
// const Product = db.Product;
// const Brand = db.Brand;
// const Category = db.Category;
// const SubCategory = db.SubCategory;
// const Image = db.Image;
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
// });

// // Middleware for handling multiple file uploads
// const uploadFiles = upload.fields([
//   { name: 'mainImage', maxCount: 1 },
//   { name: 'detailImages', maxCount: 10 }
// ]);

// exports.createProduct = async (req, res) => {
//   try {
//     uploadFiles(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({ error: err.message });
//       }

//       try {
//         const {
//           sku, mfr, techPartNo, shortDescp, longDescp,
//           metaTitle, metaDescp, ucpCode, productSource,
//           userId, title, brandId, categoryId, subCategoryId
//         } = req.body;

//         // Create product
//         const product = await Product.create({
//           sku,
//           mfr,
//           techPartNo,
//           shortDescp,
//           longDescp,
//           metaTitle,
//           metaDescp,
//           ucpCode,
//           productSource,
//           userId,
//           title,
//           brandId: brandId || null,
//           categoryId: categoryId || null,
//           subCategoryId: subCategoryId || null,
//           mainImage: req.files?.mainImage ? req.files.mainImage[0].filename : null
//         });

//         // Handle detail images
//         if (req.files?.detailImages) {
//           const imagePromises = req.files.detailImages.map(async (file) => {
//             await Image.create({
//               imageTitle: file.originalname,
//               url: file.filename,
//               productId: product.id
//             });
//           });
//           await Promise.all(imagePromises);
//         }

//         const productWithRelations = await Product.findByPk(product.id, {
//           include: [Brand, Category, SubCategory, Image],
//         });

//         res.status(201).json(productWithRelations);
//       } catch (error) {
//         res.status(500).json({ error: error.message });
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const db = require('../config/db');
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;
const SubCategory = db.SubCategory;
const Image = db.Image;
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware for handling multiple file uploads
const uploadFiles = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'detailImages', maxCount: 10 }
]);

exports.createProduct = async (req, res) => {
  try {
    uploadFiles(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        // Parse form data - handle both JSON and form-data
        const productData = {
          sku: req.body.sku,
          mfr: req.body.mfr,
          techPartNo: req.body.techPartNo,
          shortDescp: req.body.shortDescp,
          longDescp: req.body.longDescp,
          metaTitle: req.body.metaTitle,
          metaDescp: req.body.metaDescp,
          ucpCode: req.body.ucpCode,
          productSource: req.body.productSource,
          userId: req.body.userId,
          title: req.body.title,
          brandId: req.body.brandId || null,
          categoryId: req.body.categoryId || null,
          subCategoryId: req.body.subCategoryId || null
        };

        // Handle brandId conversion to integer if it exists
        if (productData.brandId) {
          productData.brandId = parseInt(productData.brandId);
        }
        if (productData.categoryId) {
          productData.categoryId = parseInt(productData.categoryId);
        }
        if (productData.subCategoryId) {
          productData.subCategoryId = parseInt(productData.subCategoryId);
        }

        // Handle main image
        if (req.files?.mainImage) {
          productData.mainImage = req.files.mainImage[0].filename;
        }

        // Create product
        const product = await Product.create(productData);

        // Handle detail images
        if (req.files?.detailImages) {
          const imagePromises = req.files.detailImages.map(async (file) => {
            await Image.create({
              imageTitle: file.originalname,
              url: file.filename,
              productId: product.id
            });
          });
          await Promise.all(imagePromises);
        }

        // Fetch the complete product with relations
        const productWithRelations = await Product.findByPk(product.id, {
          include: [
            { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
            { model: SubCategory, as: 'subCategory' },
            { model: Image, as: 'images' }
          ],
        });

        res.status(201).json(productWithRelations);
      } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ... keep the rest of your controller methods the same


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [          { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
            { model: SubCategory, as: 'subCategory' },
            { model: Image, as: 'images' }],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [          { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
            { model: SubCategory, as: 'subCategory' },
            { model: Image, as: 'images' }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    uploadFiles(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const updateData = { ...req.body };

        // Handle main image update
        if (req.files?.mainImage) {
          updateData.mainImage = req.files.mainImage[0].filename;
        }

        await product.update(updateData);

        // Handle detail images update
        if (req.files?.detailImages) {
          // First, remove existing images
          await Image.destroy({ where: { productId: product.id } });

          // Add new images
          const imagePromises = req.files.detailImages.map(async (file) => {
            await Image.create({
              imageTitle: file.originalname,
              url: file.filename,
              productId: product.id
            });
          });
          await Promise.all(imagePromises);
        }

        const updatedProduct = await Product.findByPk(req.params.id, {
          include: [          { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
            { model: SubCategory, as: 'subCategory' },
            { model: Image, as: 'images' }],
        });

        res.json(updatedProduct);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete associated images
    await Image.destroy({ where: { productId: product.id } });

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};