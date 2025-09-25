const db = require('../config/db');
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;
const SubCategory = db.SubCategory;
const Image = db.Image;
const TechProduct = db.TechProduct;
const TechProductName = db.TechProductName;
const ProductDocument = db.ProductDocument; // ✅ Add this
const ProductBulletPoint = db.ProductBulletPoint; // ✅ Add this
const axios = require("axios");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// ...... new lines recently added ......//
const ProductImportJob = db.ProductImportJob; // You'll need to create this model
const ProductImportItem = db.ProductImportItem; // You'll need to create this model
const { Op } = require('sequelize');


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

// 📌 NEW HELPER FUNCTIONS - Define them in this file
// Helper function: Extract and save PDF documents from Multimedia
const processProductDocuments = async (multimediaData, productId) => {
  try {
    if (!multimediaData || !Array.isArray(multimediaData)) {
      console.log("❌ No multimedia data found or invalid format");
      return;
    }

    for (const media of multimediaData) {
      // Only process PDF documents
      if (media.ContentType === 'application/pdf' && media.URL) {
        await ProductDocument.create({
          documentUrl: media.URL,
          contentType: media.ContentType,
          documentType: media.Type || 'document',
          description: media.Description || `Product Document`,
          productId: productId
        });
        console.log(`✅ PDF document saved: ${media.URL}`);
      }
    }
  } catch (error) {
    console.error("❌ Error processing product documents:", error);
  }
};

// Helper function: Extract and save bullet points from GeneratedBulletPoints
const processBulletPoints = async (bulletPointsData, productId) => {
  try {
    if (!bulletPointsData || !bulletPointsData.Values || !Array.isArray(bulletPointsData.Values)) {
      console.log("❌ No bullet points data found or invalid format");
      return;
    }

    // Clear existing bullet points for this product
    await ProductBulletPoint.destroy({ where: { productId } });

    // Process each bullet point value
    for (const [index, bulletPoint] of bulletPointsData.Values.entries()) {
      if (bulletPoint && typeof bulletPoint === 'string') {
        await ProductBulletPoint.create({
          point: bulletPoint.trim(),
          orderIndex: index,
          productId: productId
        });
      }
    }
    
    console.log(`✅ ${bulletPointsData.Values.length} bullet points saved for product ID: ${productId}`);
  } catch (error) {
    console.error("❌ Error processing bullet points:", error);
  }
};

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

// 📌 Helper function: Extract UPC from Icecat response
const extractUPC = (icecatData) => {
  try {
    const generalInfo = icecatData.data?.GeneralInfo;
    
    // Method 1: Direct UPC field
    if (generalInfo?.UPC) {
      return generalInfo.UPC;
    }

    // Method 3: Check GTIN if it's 12 digits (UPC length)
    if (generalInfo?.GTIN && generalInfo.GTIN.length === 12) {
      return generalInfo.GTIN;
    }

    console.log("📦 Extracted UPC:", generalInfo?.UPC || "Not found");
    return generalInfo?.UPC || null;

  } catch (error) {
    console.error("❌ Error extracting UPC:", error);
    return null;
  }
};

// 📌 Helper function: Check if product already exists
const findExistingProduct = async (productCode, brandId, upc, icecatData) => {
  try {
    // Check by SKU and brand combination (most reliable)
    const productBySku = await Product.findOne({
      where: { 
        sku: productCode,
        brandId: brandId
      }
    });
    
    if (productBySku) {
      console.log(`✅ Found existing product by SKU: ${productCode} and brandId: ${brandId}`);
      return productBySku;
    }

    // Check by UPC if available
    if (upc && upc !== "Null") {
      const productByUpc = await Product.findOne({
        where: { upcCode: upc }
      });
      
      if (productByUpc) {
        console.log(`✅ Found existing product by UPC: ${upc}`);
        return productByUpc;
      }
    }

    // Check by title and brand (fallback)
    const generalInfo = icecatData?.data?.GeneralInfo;
    const productTitle = generalInfo?.ProductName || generalInfo?.Title;
    
    if (productTitle) {
      const productByTitle = await Product.findOne({
        where: { 
          title: productTitle,
          brandId: brandId
        }
      });
      
      if (productByTitle) {
        console.log(`✅ Found existing product by title: ${productTitle} and brandId: ${brandId}`);
        return productByTitle;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding existing product:", error);
    return null;
  }
};

// 📌 Helper function: Update existing product
const updateExistingProduct = async (existingProduct, productData, newMainImage) => {
  try {
    // Preserve the existing main image if no new one is provided
    if (!newMainImage) {
      productData.mainImage = existingProduct.mainImage;
    }

    // Update the product
    await Product.update(productData, {
      where: { id: existingProduct.id }
    });

    console.log(`✅ Updated existing product ID: ${existingProduct.id}`);
    return await Product.findByPk(existingProduct.id);
  } catch (error) {
    console.error("❌ Error updating existing product:", error);
    throw error;
  }
};

// 📌 Helper function: Clean up old images and tech specs
const cleanupProductAssets = async (productId) => {
  try {
    // Delete existing images
    await Image.destroy({ where: { productId } });
    console.log(`✅ Cleared existing images for product ID: ${productId}`);

    // Delete existing tech specs
    await TechProduct.destroy({ where: { productId } });
    console.log(`✅ Cleared existing tech specs for product ID: ${productId}`);

    // Delete existing documents
    await ProductDocument.destroy({ where: { productId } });
    console.log(`✅ Cleared existing documents for product ID: ${productId}`);

    // Delete existing bullet points
    await ProductBulletPoint.destroy({ where: { productId } });
    console.log(`✅ Cleared existing bullet points for product ID: ${productId}`);

    return true;
  } catch (error) {
    console.error("❌ Error cleaning up product assets:", error);
    return false;
  }
};

// 📌 Main import function
exports.importProduct = async (req, res) => {
  console.log("Import product request received:", req.body);

  try {
    const { productCode, brand } = req.body;

    if (!productCode || !brand) {
      return res.status(400).json({
        error: "Product code and brand are required",
      });
    }

    const response = await axios.get("https://live.icecat.biz/api/", {
      params: {
        shopname: "vcloudchoice",
        lang: "en",
        Brand: brand,
        ProductCode: productCode,
        app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf",
      },
    });

    // Extract UPC only
    const upc = extractUPC(response.data);

    // Ensure brand exists
    let brandRecord = await Brand.findOne({ where: { title: brand } });
    if (!brandRecord) {
      brandRecord = await Brand.create({ title: brand });
    }

    // ✅ CHECK FOR EXISTING PRODUCT
    const existingProduct = await findExistingProduct(productCode, brandRecord.id, upc, response.data);
    let isUpdate = false;
    let product;

    const ImageUrl = response.data.data?.Image;
    const mainImageUrl = ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;
    
    let mainImageFilename = null;

    if (mainImageUrl) {
      const timestamp = Date.now();
      const imageExt = path.extname(mainImageUrl) || ".jpg";
      mainImageFilename = `icecat_${productCode}_main_${timestamp}${imageExt}`;
      await downloadImage(mainImageUrl, mainImageFilename);
    }

    const Category = response.data.data?.GeneralInfo?.Category?.Name?.Value;
    let SubCategory = await SubCategorys.findOne({ where: { title: Category } });
    if (!SubCategory) {
      SubCategory = await SubCategorys.create({ title: Category || 'Uncategorized', parentId: 1 });
    }
    
    const generalInfo = response.data.data?.GeneralInfo;

    const productData = {
      sku: productCode,
      mfr: productCode,
      techPartNo: null,
      shortDescp: generalInfo?.Title || null,
      longDescp: generalInfo?.Description?.LongDesc || null,
      metaTitle: generalInfo?.Title || null,
      metaDescp: generalInfo?.Description?.LongDesc || null,
      upcCode: upc || "Null",
      productSource: "icecat",
      userId: 1,
      mainImage: mainImageFilename || null,
      title: generalInfo?.ProductName || generalInfo?.Title || productCode,
      price: req.body.price ? parseFloat(req.body.price) : 0.0,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
      brandId: brandRecord.id,
      categoryId: 1,
      subCategoryId: SubCategory.id,
    };

    if (existingProduct) {
      // ✅ UPDATE EXISTING PRODUCT
      isUpdate = true;
      
      // Clean up old assets
      await cleanupProductAssets(existingProduct.id);
      
      // Update the product
      product = await updateExistingProduct(existingProduct, productData, mainImageFilename);
      console.log(`🔄 Updated existing product: ${product.title}`);
    } else {
      // ✅ CREATE NEW PRODUCT
      product = await Product.create(productData);
      console.log(`🆕 Created new product: ${product.title}`);
    }

    // ✅ PROCESS PDF DOCUMENTS FROM MULTIMEDIA
    const multimediaData = response.data.data?.Multimedia;
    if (multimediaData) {
      await processProductDocuments(multimediaData, product.id);
    }

    // ✅ PROCESS BULLET POINTS FROM GeneratedBulletPoints
    const generatedBulletPoints = response.data.data?.GeneratedBulletPoints;
    if (generatedBulletPoints) {
      await processBulletPoints(generatedBulletPoints, product.id);
    }
    
    // Process gallery images
    const gallery = response.data.data?.Gallery;
    if (gallery && Array.isArray(gallery)) {
      for (const [index, img] of gallery.entries()) {
        const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;
        if (!imgUrl) continue;
        
        const timestamp = Date.now();
        const imageExt = path.extname(imgUrl) || ".jpg";
        const galleryImageFilename = `icecat_${productCode}_gallery_${index}_${timestamp}${imageExt}`;

        const downloadedFilename = await downloadImage(imgUrl, galleryImageFilename);
        
        if (downloadedFilename) {
          await Image.create({
            imageTitle: `Image ${index + 1}`,
            url: galleryImageFilename,
            productId: product.id,
          });
          console.log(`✅ Image ${index + 1} associated with product`);
        }
      }
    }

    // Process technical specifications
    try {
      const featuresGroups = response.data.data?.FeaturesGroups;
      
      if (featuresGroups) {
        for (const group of featuresGroups) {
          let techSpecGroup = await TechSpecGroup.findOne({
            where: { title: group.FeatureGroup?.Name?.Value }
          });
          
          if (!techSpecGroup) {
            techSpecGroup = await TechSpecGroup.create({
              title: group.FeatureGroup?.Name?.Value || 'General'
            });
          }
          
          for (const feature of group.Features || []) {
            let techProductName = await TechProductName.findOne({
              where: { title: feature.Feature?.Name?.Value }
            });
            
            if (!techProductName) {
              techProductName = await TechProductName.create({
                title: feature.Feature?.Name?.Value || 'Unknown'
              });
            }
            
            await TechProduct.create({
              specId: techProductName.id,
              value: feature.PresentationValue || feature.RawValue || feature.Value || '',
              techspecgroupId: techSpecGroup.id,
              productId: product.id
            });
          }
        }
      }
      
      console.log(`✅ Successfully processed tech specs for product ID: ${product.id}`);
      
    } catch (error) {
      console.error('❌ Error processing Icecat data:', error);
    }

    res.status(201).json({
      message: isUpdate ? "Product updated successfully" : "Product imported successfully",
      action: isUpdate ? "updated" : "created",
      product: {
        id: product.id,
        title: product.title,
        sku: product.sku,
        upc: product.upcCode,
        brand: brandRecord.title,
        existingProductUpdated: isUpdate,
        documentsCount: multimediaData ? multimediaData.length : 0,
        bulletPointsCount: generatedBulletPoints ? generatedBulletPoints.Values.length : 0
      },
    });
  } catch (error) {
    console.error(
      "❌ Error importing/updating product:",
      error.response?.data || error.message
    );
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
          upcCode: req.body.upcCode || null,
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
        { model: Image, as: 'images' },
        //...... new lines recently added ......//
        // { model: TechProduct, as: "techProducts" },
        // ✅ ADD THESE NEW INCLUDES
        { model: db.ProductDocument, as: "documents" },
        { model: db.ProductBulletPoint, as: "bulletPoints", order: [['orderIndex', 'ASC']] }
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

//.... new code .....


// Excel Import Function
exports.importProductsFromExcel = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products array is required and must not be empty"
      });
    }

    // Validate daily limit (300 products)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayImports = await ProductImportJob.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    if (todayImports + products.length > 300) {
      return res.status(400).json({
        error: `Daily import limit exceeded. Today's remaining quota: ${300 - todayImports} products`
      });
    }

    // Create import job
    const importJob = await ProductImportJob.create({
      totalProducts: products.length,
      processedProducts: 0,
      successfulImports: 0,
      failedImports: 0,
      status: 'scheduled',
      progress: 0
    });

    // Create import items
    const importItems = products.map((product, index) => ({
      jobId: importJob.id,
      productCode: product['Product Code'],
      brand: product.Brand,
      price: product.Price || 0,
      quantity: product.Quantity || 0,
      status: 'pending',
      orderIndex: index
    }));

    await ProductImportItem.bulkCreate(importItems);

    // Schedule the import job (you'll implement the cron job separately)
    scheduleImportJob(importJob.id);

    res.status(201).json({
      success: true,
      jobId: importJob.id,
      message: `Import job scheduled successfully. ${products.length} products will be processed.`
    });

  } catch (error) {
    console.error('Error scheduling import job:', error);
    res.status(500).json({
      error: error.message || 'Failed to schedule import job'
    });
  }
};

// Get Import Jobs
exports.getImportJobs = async (req, res) => {
  try {
    const jobs = await ProductImportJob.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch import jobs'
    });
  }
};

// Get Import Job Status
exports.getImportJobStatus = async (req, res) => {
  try {
    const job = await ProductImportJob.findByPk(req.params.jobId, {
      include: [{
        model: ProductImportItem,
        as: 'items'
      }]
    });

    if (!job) {
      return res.status(404).json({
        error: 'Import job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch job status'
    });
  }
};

// Helper function to schedule import job
const scheduleImportJob = async (jobId) => {
  // This will be handled by your cron job system
  console.log(`Import job ${jobId} scheduled for processing`);
};