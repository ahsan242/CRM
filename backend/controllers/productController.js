
// src/controllers/productController.js
const db = require('../config/db');
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;
const SubCategory = db.SubCategory;
const Image = db.Image;
const TechProduct = db.TechProduct;
const TechProductName = db.TechProductName;
const axios = require("axios");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename:  (req, file, cb) => {
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

// Helper functions for Icecat data conversion
const convertIcecatValueToString = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const extractIcecatDescription = (descpData) => {
  if (!descpData) return '';
  
  if (typeof descpData === 'string') return descpData;
  
  if (Array.isArray(descpData)) {
    return descpData.map(item => {
      if (typeof item === 'string') return item;
      if (item && item._value) return item._value;
      return JSON.stringify(item);
    }).join('\n\n');
  }
  
  if (descpData._value) return descpData._value;
  
  if (descpData.LongDesc) return descpData.LongDesc;
  if (descpData.ShortDesc) return descpData.ShortDesc;
  
  return JSON.stringify(descpData);
};

// Helper function to download image from URL
const downloadImage = async (url, filename) => {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
};

// Helper function to find or create brand
const findOrCreateBrand = async (brandName) => {
  if (!brandName) return null;
  
  const [brand] = await Brand.findOrCreate({
    where: { title: brandName },
    defaults: { title: brandName }
  });
  
  return brand.id;
};

// Helper function to find or create category
const findOrCreateCategory = async (categoryName) => {
  if (!categoryName) return null;
  
  const [category] = await Category.findOrCreate({
    where: { title: categoryName },
    defaults: { title: categoryName }
  });
  
  return category.id;
};

// Helper function to find or create tech specification names
const findOrCreateTechSpec = async (specName) => {
  if (!specName) return null;
  
  const [spec] = await TechProductName.findOrCreate({
    where: { title: specName },
    defaults: { title: specName }
  });
  
  return spec.id;
};

exports.importProduct = async (req, res) => {
  console.log('Import product request received:', req.body);
  
  try {
    // Validate required fields
    const { productCode, brand, category } = req.body;
    
    if (!productCode || !brand) {
      return res.status(400).json({ 
        error: 'Product code and brand are required' 
      });
    }

    // Call Icecat API
    const response = await axios.get("https://live.icecat.biz/api/", {
      params: {
        shopname: "vcloudchoice",
        lang: "en",
        Brand: brand,
        ProductCode: productCode,
        app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf"
      }
    });

    const icecatData = response.data;
    console.log("Icecat data received for:", icecatData.data?.GeneralInfo?.Title);

    if (!icecatData.data) {
      return res.status(404).json({ error: 'Product not found in Icecat database' });
    }

    // Process and save product data
    const generalInfo = icecatData.data.GeneralInfo;
    const productFamily = icecatData.data.ProductFamily;
    
    // Debug logging to see what Icecat returns
    console.log('Icecat shortDescp:', generalInfo?.ProductDescription?.ShortDesc);
    console.log('Icecat longDescp:', generalInfo?.ProductDescription?.LongDesc);
    console.log('Icecat SummaryDescription:', generalInfo?.SummaryDescription);
    console.log('Type of shortDescp:', typeof generalInfo?.ProductDescription?.ShortDesc);
    console.log('Type of longDescp:', typeof generalInfo?.ProductDescription?.LongDesc);

    // Find or create brand
    const brandId = await findOrCreateBrand(brand);
    
    // Find or create category
    const categoryName = productFamily?.Name || category || 'Uncategorized';
    const categoryId = await findOrCreateCategory(categoryName);

    // Prepare product data with proper conversion
    const productData = {
      sku: productCode,
      mfr: generalInfo?.Model || null,
      techPartNo: productCode,
      shortDescp: convertIcecatValueToString(generalInfo?.ProductDescription?.ShortDesc || generalInfo?.SummaryDescription || ''),
      longDescp: convertIcecatValueToString(generalInfo?.ProductDescription?.LongDesc || generalInfo?.SummaryDescription || ''),
      metaTitle: convertIcecatValueToString(generalInfo?.Title || `${brand} ${productCode}`),
      metaDescp: convertIcecatValueToString(generalInfo?.ProductDescription?.ShortDesc || ''),
      title: convertIcecatValueToString(generalInfo?.Title || `${brand} ${productCode}`),
      price: 0.00,
      quantity: 0,
      brandId: brandId,
      categoryId: categoryId,
      productSource: 'icecat'
    };

    // Create the product
    const product = await Product.create(productData);

    // Download and save main image
    if (generalInfo?.ProductImage && generalInfo.ProductImage.HighImg) {
      try {
        const imageUrl = generalInfo.ProductImage.HighImg;
        const imageExt = path.extname(imageUrl) || '.jpg';
        const imageFilename = `icecat_${product.id}_main${imageExt}`;
        
        const downloadedFilename = await downloadImage(imageUrl, imageFilename);
        
        if (downloadedFilename) {
          await product.update({ mainImage: downloadedFilename });
          
          // Also create an image record
          await Image.create({
            imageTitle: `${brand} ${productCode} Main Image`,
            url: downloadedFilename,
            productId: product.id
          });
        }
      } catch (imageError) {
        console.error('Error downloading main image:', imageError);
      }
    }

    // Process and save technical specifications
    if (icecatData.data.Specs) {
      for (const [specId, specData] of Object.entries(icecatData.data.Specs)) {
        if (specData.Value && specData.Name && specData.Value._value) {
          try {
            const specNameId = await findOrCreateTechSpec(specData.Name._value);
            
            if (specNameId) {
              await TechProduct.create({
                productId: product.id,
                specId: specNameId,
                value: specData.Value._value
              });
            }
          } catch (specError) {
            console.error('Error saving tech spec:', specError);
          }
        }
      }
    }

    // Download additional images
    if (icecatData.data.GalleryInfo && icecatData.data.GalleryInfo.Image) {
      const images = Array.isArray(icecatData.data.GalleryInfo.Image) 
        ? icecatData.data.GalleryInfo.Image 
        : [icecatData.data.GalleryInfo.Image];
      
      for (const [index, imageInfo] of images.entries()) {
        if (imageInfo.HighImg) {
          try {
            const imageUrl = imageInfo.HighImg;
            const imageExt = path.extname(imageUrl) || '.jpg';
            const imageFilename = `icecat_${product.id}_${index}${imageExt}`;
            
            const downloadedFilename = await downloadImage(imageUrl, imageFilename);
            
            if (downloadedFilename) {
              await Image.create({
                imageTitle: `${brand} ${productCode} Image ${index + 1}`,
                url: downloadedFilename,
                productId: product.id
              });
            }
          } catch (imageError) {
            console.error('Error downloading additional image:', imageError);
          }
        }
      }
    }

    // Get the complete product with all relations
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        { model: Brand, as: 'brand' },
        { model: Category, as: 'category' },
        { model: SubCategory, as: 'subCategory' },
        { model: Image, as: 'images' },
        { 
          model: TechProduct, 
          as: 'techProducts',
          include: [{ model: TechProductName, as: 'specification' }]
        }
      ],
    });

    res.status(201).json({
      message: 'Product imported successfully',
      product: completeProduct
    });
    
  } catch (error) {
    console.error("❌ Error in importProduct:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Product not found in Icecat database'
      });
    }
    
    res.status(500).json({
      error: error.response?.data?.message || error.message || 'Internal server error during import'
    });
  }
};

exports.getimportsProducts = async (req, res) => {
  try {
    // Get all products imported from Icecat
    const importedProducts = await Product.findAll({
      where: {
        productSource: 'icecat'
      },
      include: [
        { model: Brand, as: 'brand' },
        { model: Category, as: 'category' }
      ],
      order: [['id', 'DESC']]
    });
    
    res.status(200).json({
      message: 'Imported products retrieved successfully',
      data: importedProducts
    });
    
  } catch (err) {
    console.error('Error in getimportsProducts:', err);
    res.status(500).json({ 
      error: err.message || 'Internal server error fetching imports' 
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    uploadFiles(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        // Parse form data
        const productData = {
          sku: req.body.sku || null,
          mfr: req.body.mfr || null,
          techPartNo: req.body.techPartNo || null,
          shortDescp: req.body.shortDescp || null,
          longDescp: req.body.longDescp || null,
          metaTitle: req.body.metaTitle || null,
          metaDescp: req.body.metaDescp || null,
          ucpCode: req.body.ucpCode || null,
          productSource: req.body.productSource || null,
          userId: req.body.userId || null,
          title: req.body.title || null,
          price: req.body.price ? parseFloat(req.body.price) : 0.00,
          quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
          brandId: req.body.brandId || null,
          categoryId: req.body.categoryId || null,
          subCategoryId: req.body.subCategoryId || null
        };

        // Validation
        if (!productData.sku) {
          return res.status(400).json({ error: 'SKU is required' });
        }
        if (!productData.title) {
          return res.status(400).json({ error: 'Title is required' });
        }

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

        console.log('Product data to create:', productData);

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

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Brand, as: 'brand' },
        { model: Category, as: 'category' },
        { model: SubCategory, as: 'subCategory' },
        { model: Image, as: 'images' }
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Brand, as: 'brand' },
        { model: Category, as: 'category' },
        { model: SubCategory, as: 'subCategory' },
        { model: Image, as: 'images' }
      ],
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

        // Handle numeric fields
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);

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
          include: [
            { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
            { model: SubCategory, as: 'subCategory' },
            { model: Image, as: 'images' }
          ],
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