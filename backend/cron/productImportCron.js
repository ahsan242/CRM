// src/cron/productImportCron.js
const cron = require('node-cron');
const db = require("../config/db");
const ProductImportJob = db.ProductImportJob;
const ProductImportItem = db.ProductImportItem;
const Product = db.Product;
const Brand = db.Brand;
const Image = db.Image;
const SubCategory = db.SubCategory;
const TechSpecGroup = db.TechSpecGroup;
const TechProductName = db.TechProductName;
const TechProduct = db.TechProduct;
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

class ProductImportCron {
  constructor() {
    this.isProcessing = false;
    this.setupCron();
  }

  setupCron() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.processScheduledJobs();
    });

    console.log('✅ Product Import Cron Job initialized');
  }

  async processScheduledJobs() {
    if (this.isProcessing) {
      console.log('⏳ Import process already running, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const scheduledJobs = await ProductImportJob.findAll({
        where: { status: 'scheduled' },
        order: [['createdAt', 'ASC']],
        limit: 1
      });

      for (const job of scheduledJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('❌ Error in import cron job:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processJob(job) {
    try {
      console.log(`🔄 Processing import job ${job.id}`);
      
      await job.update({ 
        status: 'processing',
        startedAt: new Date()
      });

      const items = await ProductImportItem.findAll({
        where: { jobId: job.id, status: 'pending' },
        order: [['orderIndex', 'ASC']]
      });

      for (const item of items) {
        await this.processItem(job, item);
        
        // Update job progress
        const processedCount = await ProductImportItem.count({
          where: { jobId: job.id, status: { [Op.ne]: 'pending' } }
        });
        
        const progress = (processedCount / job.totalProducts) * 100;
        await job.update({ progress });
      }

      // Finalize job
      const successfulImports = await ProductImportItem.count({
        where: { jobId: job.id, status: 'completed' }
      });

      const failedImports = await ProductImportItem.count({
        where: { jobId: job.id, status: 'failed' }
      });

      await job.update({
        status: 'completed',
        processedProducts: successfulImports + failedImports,
        successfulImports,
        failedImports,
        completedAt: new Date(),
        progress: 100
      });

      console.log(`✅ Import job ${job.id} completed successfully. Success: ${successfulImports}, Failed: ${failedImports}`);

    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      await job.update({
        status: 'failed',
        errorMessage: error.message
      });
    }
  }

  async processItem(job, item) {
    try {
      await item.update({ status: 'processing' });

      console.log(`📦 Importing product: ${item.productCode}, Brand: ${item.brand}`);

      // Use your existing Icecat import logic
      const response = await axios.get("https://live.icecat.biz/api/", {
        params: {
          shopname: "vcloudchoice",
          lang: "en",
          Brand: item.brand,
          ProductCode: item.productCode,
          app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf",
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from Icecat API');
      }

      // Process the product using your existing logic
      const product = await this.createProductFromIcecat(response.data, {
        productCode: item.productCode,
        brand: item.brand,
        price: item.price || 0,
        quantity: item.quantity || 0
      });
      
      await item.update({
        status: 'completed',
        productId: product.id,
        errorMessage: null
      });

      console.log(`✅ Successfully imported product: ${product.title}`);

    } catch (error) {
      console.error(`❌ Error processing item ${item.id}:`, error.message);
      await item.update({
        status: 'failed',
        errorMessage: error.message
      });
    }
  }

  // ✅ COMPLETE INTEGRATION OF YOUR EXISTING LOGIC
  async createProductFromIcecat(icecatData, productData) {
    try {
      const { productCode, brand, price, quantity } = productData;

      // Extract UPC
      const upc = this.extractUPC(icecatData);
      
      // Extract EndOfLifeDate
      const endOfLifeDate = this.extractEndOfLifeDate(icecatData);

      // Ensure brand exists
      let brandRecord = await Brand.findOne({ where: { title: brand } });
      if (!brandRecord) {
        brandRecord = await Brand.create({ title: brand });
      }

      // Check for existing product
      const existingProduct = await this.findExistingProduct(productCode, brandRecord.id, upc);
      let isUpdate = false;
      let product;

      // Download main image
      const ImageUrl = icecatData.data?.Image;
      const mainImageUrl = ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;
      
      let mainImageFilename = null;
      if (mainImageUrl) {
        mainImageFilename = await this.downloadImage(mainImageUrl, productCode);
      }

      // Handle category
      const Category = icecatData.data?.GeneralInfo?.Category?.Name?.Value;
      let subCategory = await SubCategory.findOne({ where: { title: Category } });
      if (!subCategory) {
        subCategory = await SubCategory.create({ title: Category || 'Uncategorized', parentId: 1 });
      }

      // Generate bullet points
      const generateBulletPoints = icecatData.data?.GeneralInfo?.GeneratedBulletPoints;
      let bulletHtml = "<ul></ul>";
      
      if (generateBulletPoints && Array.isArray(generateBulletPoints.Values)) {
        bulletHtml = "<ul>\n" +
          generateBulletPoints.Values.map((point) => `  <li>${point}</li>`).join("\n") +
          "\n</ul>";
      }

      const generalInfo = icecatData.data?.GeneralInfo;

      // Prepare product data
      const productCreateData = {
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
        mainImage: mainImageFilename,
        title: generalInfo?.ProductName || generalInfo?.Title || productCode,
        price: price,
        quantity: quantity,
        brandId: brandRecord.id,
        bulletsPoint: bulletHtml,
        categoryId: 1,
        subCategoryId: subCategory.id,
        endOfLifeDate: endOfLifeDate,
      };

      if (existingProduct) {
        // Update existing product
        isUpdate = true;
        
        // Clean up old assets
        await this.cleanupProductAssets(existingProduct.id);
        
        // Update the product
        await Product.update(productCreateData, {
          where: { id: existingProduct.id }
        });
        
        product = await Product.findByPk(existingProduct.id);
        console.log(`🔄 Updated existing product: ${product.title}`);
      } else {
        // Create new product
        product = await Product.create(productCreateData);
        console.log(`🆕 Created new product: ${product.title}`);
      }

      // Process gallery images
      const gallery = icecatData.data?.Gallery;
      if (gallery && Array.isArray(gallery)) {
        for (const [index, img] of gallery.entries()) {
          const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;
          if (!imgUrl) continue;

          const galleryImageFilename = await this.downloadGalleryImage(imgUrl, productCode, index);
          
          if (galleryImageFilename) {
            await Image.create({
              imageTitle: `Image ${index + 1}`,
              url: galleryImageFilename,
              productId: product.id,
            });
          }
        }
      }

      // Process technical specifications
      await this.processTechSpecs(icecatData, product.id);

      return product;

    } catch (error) {
      console.error('❌ Error in createProductFromIcecat:', error);
      throw error;
    }
  }

  // ✅ HELPER FUNCTIONS FROM YOUR EXISTING CONTROLLER
  extractUPC(icecatData) {
    try {
      const generalInfo = icecatData.data?.GeneralInfo;
      if (generalInfo?.UPC) return generalInfo.UPC;
      if (generalInfo?.GTIN && generalInfo.GTIN.length === 12) return generalInfo.GTIN;
      return null;
    } catch (error) {
      console.error("❌ Error extracting UPC:", error);
      return null;
    }
  }

  extractEndOfLifeDate(icecatData) {
    try {
      const generalInfo = icecatData.data?.GeneralInfo;
      const endOfLifeDate = generalInfo?.EndOfLifeDate;
      
      if (endOfLifeDate) {
        const [day, month, year] = endOfLifeDate.split('-');
        const dateObject = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObject.getTime())) return dateObject;
      }
      return null;
    } catch (error) {
      console.error("❌ Error extracting EndOfLifeDate:", error);
      return null;
    }
  }

  async findExistingProduct(productCode, brandId, upc) {
    try {
      // Check by SKU and brand
      const productBySku = await Product.findOne({
        where: { sku: productCode, brandId: brandId }
      });
      if (productBySku) return productBySku;

      // Check by UPC
      if (upc && upc !== "Null") {
        const productByUpc = await Product.findOne({ where: { upcCode: upc } });
        if (productByUpc) return productByUpc;
      }

      return null;
    } catch (error) {
      console.error("❌ Error finding existing product:", error);
      return null;
    }
  }

  async downloadImage(url, productCode) {
    try {
      const response = await axios({
        url: url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const uploadsDir = path.join(__dirname, "..", "..", "uploads", "products");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const imageExt = path.extname(url) || ".jpg";
      const filename = `icecat_${productCode}_main_${timestamp}${imageExt}`;
      const filePath = path.join(uploadsDir, filename);

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return filename;
    } catch (error) {
      console.error("❌ Error downloading image:", error.message);
      return null;
    }
  }

  async downloadGalleryImage(url, productCode, index) {
    try {
      const response = await axios({
        url: url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const uploadsDir = path.join(__dirname, "..", "..", "uploads", "products");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const imageExt = path.extname(url) || ".jpg";
      const filename = `icecat_${productCode}_gallery_${index}_${timestamp}${imageExt}`;
      const filePath = path.join(uploadsDir, filename);

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return filename;
    } catch (error) {
      console.error("❌ Error downloading gallery image:", error.message);
      return null;
    }
  }

  async cleanupProductAssets(productId) {
    try {
      await Image.destroy({ where: { productId } });
      await TechProduct.destroy({ where: { productId } });
      console.log(`✅ Cleared assets for product ID: ${productId}`);
    } catch (error) {
      console.error("❌ Error cleaning up product assets:", error);
    }
  }

  async processTechSpecs(icecatData, productId) {
    try {
      const featuresGroups = icecatData.data?.FeaturesGroups;
      if (!featuresGroups) return;

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
            productId: productId
          });
        }
      }

      console.log(`✅ Processed tech specs for product ID: ${productId}`);
    } catch (error) {
      console.error('❌ Error processing tech specs:', error);
    }
  }
}

module.exports = ProductImportCron;