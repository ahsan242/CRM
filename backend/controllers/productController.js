const db = require("../config/db");
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;
const SubCategory = db.SubCategory;
const Image = db.Image;
const TechProduct = db.TechProduct;
const TechProductName = db.TechProductName;
const ProductDocument = db.ProductDocument;
const ProductBulletPoint = db.ProductBulletPoint;
const ProductForImport = db.productForImport;
const ProductImportJob = db.ProductImportJob;
const ProductImportItem = db.ProductImportItem;
const TechSpecGroup = db.TechSpecGroup;

const { Op } = require("sequelize");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

const uploadFiles = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "detailImages", maxCount: 10 },
]);

// ===== HELPER FUNCTIONS =====

// Helper function to ensure category exists
const ensureCategoryExists = async (categoryId = 1) => {
  try {
    let category = await Category.findByPk(categoryId);
    if (!category) {
      // If the specific ID doesn't exist, try to find any active category
      category = await Category.findOne({
        where: { status: "active" },
        order: [["id", "ASC"]],
      });

      if (!category) {
        // Create a default category if none exists
        category = await Category.create({
          title: "Electronics",
          description: "Default electronics category",
          status: "active",
        });
        console.log(`✅ Created default category with ID: ${category.id}`);
      }
    }
    return category;
  } catch (error) {
    console.error("Error ensuring category exists:", error);
    // Final fallback: get the first category or create one
    const fallbackCategory =
      (await Category.findOne()) ||
      (await Category.create({
        title: "General",
        description: "General category",
        status: "active",
      }));
    return fallbackCategory;
  }
};

// Helper function: Extract and save PDF documents from Multimedia
const processProductDocuments = async (multimediaData, productId) => {
  try {
    if (!multimediaData || !Array.isArray(multimediaData)) {
      console.log("❌ No multimedia data found or invalid format");
      return;
    }

    for (const media of multimediaData) {
      if (media.ContentType === "application/pdf" && media.URL) {
        await ProductDocument.create({
          documentUrl: media.URL,
          contentType: media.ContentType,
          documentType: media.Type || "document",
          description: media.Description || `Product Document`,
          productId: productId,
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
    if (
      !bulletPointsData ||
      !bulletPointsData.Values ||
      !Array.isArray(bulletPointsData.Values)
    ) {
      console.log("❌ No bullet points data found or invalid format");
      return;
    }

    await ProductBulletPoint.destroy({ where: { productId } });

    for (const [index, bulletPoint] of bulletPointsData.Values.entries()) {
      if (bulletPoint && typeof bulletPoint === "string") {
        await ProductBulletPoint.create({
          point: bulletPoint.trim(),
          orderIndex: index,
          productId: productId,
        });
      }
    }

    console.log(
      `✅ ${bulletPointsData.Values.length} bullet points saved for product ID: ${productId}`
    );
  } catch (error) {
    console.error("❌ Error processing bullet points:", error);
  }
};

// 📌 FIXED Helper function: download image to uploads folder
const downloadImage = async (url, filename) => {
  try {
    console.log(`🖼️ Attempting to download image from: ${url}`);
    console.log(`📁 Target filename: ${filename}`);

    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
      timeout: 30000, // 30 second timeout
    });

    // FIXED: Correct uploads directory path
    const uploadsDir = path.join(__dirname, "..", "uploads", "products");
    console.log(`📁 Uploads directory: ${uploadsDir}`);

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log(`📁 Creating directory: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // FIXED: Better file extension handling
    let ext = path.extname(url.split("?")[0]); // Remove query parameters
    if (!ext || ext === "") {
      // Try to get extension from content type
      const contentType = response.headers["content-type"];
      if (contentType) {
        if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          ext = ".jpg";
        } else if (contentType.includes("png")) {
          ext = ".png";
        } else if (contentType.includes("gif")) {
          ext = ".gif";
        } else if (contentType.includes("webp")) {
          ext = ".webp";
        } else {
          ext = ".jpg"; // Default fallback
        }
      } else {
        ext = ".jpg"; // Default fallback
      }
    }

    // Ensure filename has proper extension
    const finalFilename = filename.includes(".")
      ? filename
      : `${filename}${ext}`;
    const filePath = path.join(uploadsDir, finalFilename);

    console.log(`💾 Saving image to: ${filePath}`);

    // Save file with error handling
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`✅ Image successfully saved: ${filePath}`);

        // Verify file was actually written
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          console.log(`📊 File size: ${stats.size} bytes`);
          resolve(finalFilename);
        } else {
          reject(new Error("File was not created"));
        }
      });

      writer.on("error", (error) => {
        console.error(`❌ Error writing file: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error("❌ Error downloading image:", error.message);
    console.error("❌ Error details:", error);
    return null;
  }
};

// Helper function: Extract UPC from Icecat response
const extractUPC = (icecatData) => {
  try {
    const generalInfo = icecatData.data?.GeneralInfo;

    if (generalInfo?.UPC) {
      return generalInfo.UPC;
    }

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

// Helper function: Check if product already exists
const findExistingProduct = async (productCode, brandId, upc, icecatData) => {
  try {
    const productBySku = await Product.findOne({
      where: {
        sku: productCode,
        brandId: brandId,
      },
    });

    if (productBySku) {
      console.log(
        `✅ Found existing product by SKU: ${productCode} and brandId: ${brandId}`
      );
      return productBySku;
    }

    if (upc && upc !== "Null") {
      const productByUpc = await Product.findOne({
        where: { upcCode: upc },
      });

      if (productByUpc) {
        console.log(`✅ Found existing product by UPC: ${upc}`);
        return productByUpc;
      }
    }

    const generalInfo = icecatData?.data?.GeneralInfo;
    const productTitle = generalInfo?.ProductName || generalInfo?.Title;

    if (productTitle) {
      const productByTitle = await Product.findOne({
        where: {
          title: productTitle,
          brandId: brandId,
        },
      });

      if (productByTitle) {
        console.log(
          `✅ Found existing product by title: ${productTitle} and brandId: ${brandId}`
        );
        return productByTitle;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding existing product:", error);
    return null;
  }
};

// Helper function: Update existing product
const updateExistingProduct = async (
  existingProduct,
  productData,
  newMainImage
) => {
  try {
    if (!newMainImage) {
      productData.mainImage = existingProduct.mainImage;
    }

    await Product.update(productData, {
      where: { id: existingProduct.id },
    });

    console.log(`✅ Updated existing product ID: ${existingProduct.id}`);
    return await Product.findByPk(existingProduct.id);
  } catch (error) {
    console.error("❌ Error updating existing product:", error);
    throw error;
  }
};

// Helper function: Clean up old images and tech specs
const cleanupProductAssets = async (productId) => {
  try {
    await Image.destroy({ where: { productId } });
    await TechProduct.destroy({ where: { productId } });
    await ProductDocument.destroy({ where: { productId } });
    await ProductBulletPoint.destroy({ where: { productId } });

    console.log(`✅ Cleared existing assets for product ID: ${productId}`);
    return true;
  } catch (error) {
    console.error("❌ Error cleaning up product assets:", error);
    return false;
  }
};

// Helper function to process additional product data
const processAdditionalProductData = async (
  icecatData,
  productId,
  productCode
) => {
  try {
    const multimediaData = icecatData.data?.Multimedia;
    if (multimediaData) {
      await processProductDocuments(multimediaData, productId);
    }

    const generatedBulletPoints = icecatData.data?.GeneratedBulletPoints;
    if (generatedBulletPoints) {
      await processBulletPoints(generatedBulletPoints, productId);
    }

    const gallery = icecatData.data?.Gallery;
    if (gallery && Array.isArray(gallery)) {
      for (const [index, img] of gallery.entries()) {
        const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;
        if (!imgUrl) continue;

        const timestamp = Date.now();
        const imageExt = path.extname(imgUrl) || ".jpg";
        const galleryImageFilename = `icecat_${productCode}_gallery_${index}_${timestamp}${imageExt}`;

        const downloadedFilename = await downloadImage(
          imgUrl,
          galleryImageFilename
        );

        if (downloadedFilename) {
          await Image.create({
            imageTitle: `Image ${index + 1}`,
            url: galleryImageFilename,
            productId: productId,
          });
        }
      }
    }

    const featuresGroups = icecatData.data?.FeaturesGroups;
    if (featuresGroups) {
      for (const group of featuresGroups) {
        let techSpecGroup = await TechSpecGroup.findOne({
          where: { title: group.FeatureGroup?.Name?.Value },
        });

        if (!techSpecGroup) {
          techSpecGroup = await TechSpecGroup.create({
            title: group.FeatureGroup?.Name?.Value || "General",
          });
        }

        for (const feature of group.Features || []) {
          let techProductName = await TechProductName.findOne({
            where: { title: feature.Feature?.Name?.Value },
          });

          if (!techProductName) {
            techProductName = await TechProductName.create({
              title: feature.Feature?.Name?.Value || "Unknown",
            });
          }

          await TechProduct.create({
            specId: techProductName.id,
            value:
              feature.PresentationValue ||
              feature.RawValue ||
              feature.Value ||
              "",
            techspecgroupId: techSpecGroup.id,
            productId: productId,
          });
        }
      }
    }

    console.log(`✅ Processed additional data for product ID: ${productId}`);
  } catch (error) {
    console.error(
      `❌ Error processing additional data for product ${productId}:`,
      error
    );
  }
};

// 📌 FIXED Helper function to process a single product
const processSingleProduct = async (
  productData,
  jobId = null,
  importProduct = null
) => {
  const { productCode, brand, price, quantity, index } = productData;

  try {
    console.log(`🔍 Calling Icecat API for: ${productCode} - ${brand}`);

    const response = await axios.get("https://live.icecat.biz/api/", {
      params: {
        shopname: "vcloudchoice",
        lang: "en",
        Brand: brand,
        ProductCode: productCode,
        app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf",
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      },
    });

    // ✅ CHECK FOR 404 - PRODUCT NOT FOUND IN ICECAT
    // if (response.status === 404) {
    //   console.log(`❌ Product not found in Icecat database: ${productCode} - ${brand}`);

    //   if (importProduct) {
    //     await importProduct.update({
    //       status: 'pending',
    //       lastUpdated: new Date(),
    //       errorMessage: "Product not found in Icecat database (404)"
    //     });
    //     console.log(`🔄 Updated ${productCode} status to PENDING (not found in Icecat)`);
    //   }

    //   return {
    //     productCode,
    //     brand,
    //     status: "failed",
    //     error: "Product not found in Icecat database (404)",
    //     importStatus: 'pending'
    //   };
    // }

    if (response.status === 404) {
      console.log(
        `❌ Product not found in Icecat database: ${productCode} - ${brand}`
      );

      if (importProduct) {
        await importProduct.update({
          status: "pending", // ✅ This sets status to pending for 404 errors
          lastUpdated: new Date(),
          errorMessage: "Product not found in Icecat database (404)",
        });
        console.log(
          `🔄 Updated ${productCode} status to PENDING (not found in Icecat)`
        );
      }

      return {
        productCode,
        brand,
        status: "failed",
        error: "Product not found in Icecat database (404)",
        importStatus: "pending", // ✅ Return the actual status that was set
      };
    }

    // Handle other API errors
    if (response.status === 403 || response.status >= 500) {
      if (importProduct) {
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: `Icecat API error: ${response.status}`,
        });
      }
      return {
        productCode,
        brand,
        status: "failed",
        error: `Icecat API error: ${response.status}`,
      };
    }

    if (!response.data || !response.data.data) {
      if (importProduct) {
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: "Invalid response from Icecat API",
        });
      }
      return {
        productCode,
        brand,
        status: "failed",
        error: "Invalid response from Icecat API",
      };
    }

    // Check for Icecat API errors in response data
    if (response.data.Error) {
      console.log(
        `❌ Icecat API error for ${productCode}:`,
        response.data.Error
      );
      if (importProduct) {
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: response.data.Error.description || "Icecat API error",
        });
      }
      return {
        productCode,
        brand,
        status: "failed",
        error: response.data.Error.description || "Icecat API error",
      };
    }

    const upc = extractUPC(response.data);

    let brandRecord = await Brand.findOne({ where: { title: brand } });
    if (!brandRecord) {
      brandRecord = await Brand.create({ title: brand });
    }

    const existingProduct = await findExistingProduct(
      productCode,
      brandRecord.id,
      upc,
      response.data
    );

    // ✅ FIXED CATEGORY HANDLING - More robust approach
    const categoryName = response.data.data?.GeneralInfo?.Category?.Name?.Value;

    // Ensure we have valid category and subcategory
    let category;
    let subCategory;

    try {
      category = await ensureCategoryExists(1);
      console.log(`✅ Using category: ${category.title} (ID: ${category.id})`);

      subCategory = await ensureSubCategoryExists(categoryName, category.id);
      console.log(
        `✅ Using subcategory: ${subCategory.title} (ID: ${subCategory.id})`
      );
    } catch (categoryError) {
      console.error(
        `❌ Category setup error for ${productCode}:`,
        categoryError.message
      );

      if (importProduct) {
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: `Category setup failed: ${categoryError.message}`,
        });
      }

      return {
        productCode,
        brand,
        status: "failed",
        error: `Category setup failed: ${categoryError.message}`,
      };
    }

    const ImageUrl = response.data.data?.Image;
    const mainImageUrl = ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;

    let mainImageFilename = null;

    if (mainImageUrl) {
      const timestamp = Date.now();
      const baseFilename = `icecat_${productCode}_main_${timestamp}`;
      console.log(`🖼️ Downloading main image from: ${mainImageUrl}`);
      const downloadedFilename = await downloadImage(
        mainImageUrl,
        baseFilename
      );
      if (downloadedFilename) {
        mainImageFilename = downloadedFilename;
        console.log(
          `✅ Main image downloaded successfully: ${mainImageFilename}`
        );
      }
    }

    const generalInfo = response.data.data?.GeneralInfo;

    const productDataToCreate = {
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
      price: price || 0.0,
      quantity: quantity || 0,
      brandId: brandRecord.id,
      categoryId: category.id, // ✅ Now guaranteed to be valid
      subCategoryId: subCategory.id, // ✅ Now guaranteed to be valid
    };

    // ✅ SUCCESS CASE: Create/Update product and set status to active
    let product;
    if (existingProduct) {
      // Update existing product
      await cleanupProductAssets(existingProduct.id);
      await Product.update(productDataToCreate, {
        where: { id: existingProduct.id },
      });
      product = await Product.findByPk(existingProduct.id);
      console.log(`🔄 Updated existing product: ${product.title}`);
    } else {
      // Create new product
      product = await Product.create(productDataToCreate);
      console.log(`🆕 Created new product: ${product.title}`);
    }

    // ✅ Update import product status to ACTIVE
    if (importProduct) {
      await importProduct.update({
        status: "active",
        lastUpdated: new Date(),
        mainProductId: product.id,
      });
      console.log(
        `✅ Updated ${productCode} status to ACTIVE (successful import)`
      );
    }

    // Process additional data
    await processAdditionalProductData(response.data, product.id, productCode);

    if (jobId) {
      await ProductImportItem.create({
        jobId: jobId,
        productCode: productCode,
        brand: brand,
        productId: product.id,
        status: "completed",
        orderIndex: index,
      });
    }

    console.log(`✅ Successfully imported: ${productCode} - ${brand}`);

    return {
      productCode,
      brand,
      status: "success",
      productId: product.id,
      title: product.title,
      message: "Product imported successfully",
    };
  } catch (error) {
    console.error(
      `❌ Failed to import ${productCode} - ${brand}:`,
      error.message
    );

    // ✅ ERROR CASE: Set status to pending for any errors
    // if (importProduct) {
    //   await importProduct.update({
    //     status: "pending",
    //     lastUpdated: new Date(),
    //     errorMessage: error.message,
    //   });
    //   console.log(
    //     `🔄 Updated ${productCode} status to PENDING (error occurred)`
    //   );
    // }
     if (importProduct) {
      await importProduct.update({ 
        status: 'pending', // ✅ This sets status to pending for any other errors
        lastUpdated: new Date(),
        errorMessage: error.message
      });
      console.log(`🔄 Updated ${productCode} status to PENDING (error occurred)`);
    }

    if (jobId) {
      await ProductImportItem.create({
        jobId: jobId,
        productCode: productCode,
        brand: brand,
        status: "failed",
        errorMessage: error.message,
        orderIndex: index,
      });
    }

    return {
      productCode,
      brand,
      status: "failed",
      error: error.message,
    };
  }
};

// exports.importFromProductForImport = async (req, res) => {
//   try {
//     const {
//       count = 10,
//       status = "inactive",
//       brand,
//       distributor,
//       autoCleanup = true,
//     } = req.body;

//     console.log(`🔄 Starting import from ProductForImport table`);
//     console.log(
//       `📋 Parameters: count=${count}, status=${status}, brand=${brand}, distributor=${distributor}, autoCleanup=${autoCleanup}`
//     );

//     // Build where clause - IMPORTANT: Only get inactive products
//     const whereClause = { status: "inactive" }; // Force inactive only

//     if (brand) {
//       whereClause.brand = { [Op.iLike]: `%${brand}%` };
//     }

//     if (distributor) {
//       whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
//     }

//     // Get products from ProductForImport table
//     const productsToImport = await ProductForImport.findAll({
//       where: whereClause,
//       order: [["createdAt", "ASC"]],
//       limit: parseInt(count),
//     });

//     if (productsToImport.length === 0) {
//       return res.status(404).json({
//         error: "No products found for import with the specified criteria",
//         criteria: {
//           status,
//           brand,
//           distributor,
//         },
//       });
//     }

//     console.log(`📦 Found ${productsToImport.length} products to import`);

//     // Check daily import limit
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const todayImports = await ProductImportJob.count({
//       where: {
//         createdAt: {
//           [Op.gte]: today,
//           [Op.lt]: tomorrow,
//         },
//       },
//     });

//     if (todayImports + productsToImport.length > 300) {
//       return res.status(400).json({
//         error: `Daily import limit exceeded. Today's remaining quota: ${
//           300 - todayImports
//         } products`,
//         requested: productsToImport.length,
//         remaining: 300 - todayImports,
//       });
//     }

//     // Create import job for tracking
//     const importJob = await ProductImportJob.create({
//       totalProducts: productsToImport.length,
//       processedProducts: 0,
//       successfulImports: 0,
//       failedImports: 0,
//       status: "processing",
//       progress: 0,
//       source: "product_for_import",
//     });

//     // Track detailed results with error information
//     const results = {
//       successful: [],
//       failed: [],
//       skipped: [],
//       details: {
//         successful: [],
//         failed: [],
//         skipped: [],
//       },
//     };

//     // Process each product sequentially with enhanced error tracking
//     for (const [index, importProduct] of productsToImport.entries()) {
//       try {
//         console.log(
//           `🔄 Processing ${index + 1}/${productsToImport.length}: ${
//             importProduct.sku
//           } - ${importProduct.brand}`
//         );

//         const productData = {
//           productCode: importProduct.sku,
//           brand: importProduct.brand,
//           price: 0.0,
//           quantity: 0,
//           index: index,
//         };

//         const result = await processSingleProduct(productData, importJob.id);

//         console.log(`📊 Result for ${importProduct.sku}:`, result);

//         if (result.status === "success") {
//           results.successful.push(importProduct.id);
//           results.details.successful.push({
//             productId: importProduct.id,
//             sku: importProduct.sku,
//             newProductId: result.productId,
//             message: "Successfully imported to main catalog",
//           });

//           // ✅ UPDATE STATUS TO ACTIVE
//           await importProduct.update({
//             status: "active",
//             lastUpdated: new Date(),
//           });
//           console.log(`✅ Updated ${importProduct.sku} status to ACTIVE`);
//         } else if (result.status === "skipped") {
//           results.skipped.push(importProduct.id);
//           results.details.skipped.push({
//             productId: importProduct.id,
//             sku: importProduct.sku,
//             reason: result.message || "Product already exists in database",
//             existingProductId: result.productId,
//           });

//           // ✅ UPDATE STATUS TO ACTIVE even for skipped (already exists)
//           await importProduct.update({
//             status: "active",
//             lastUpdated: new Date(),
//           });
//           console.log(
//             `✅ Updated ${importProduct.sku} status to ACTIVE (skipped - already exists)`
//           );
//         } else {
//           results.failed.push(importProduct.id);
//           results.details.failed.push({
//             productId: importProduct.id,
//             sku: importProduct.sku,
//             reason: result.error || "Unknown error during import",
//             error: result.error,
//             suggestion: getFailureSuggestion(result.error),
//           });
//           // Keep status as inactive for failed imports
//           console.log(
//             `❌ ${importProduct.sku} failed - status remains INACTIVE`
//           );
//         }

//         // Update job progress
//         const progress = Math.round(
//           ((index + 1) / productsToImport.length) * 100
//         );
//         await importJob.update({
//           processedProducts: index + 1,
//           successfulImports: results.successful.length,
//           failedImports: results.failed.length,
//           progress: progress,
//         });

//         // Small delay to avoid rate limiting
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       } catch (error) {
//         console.error(
//           `❌ Error processing product ${importProduct.sku}:`,
//           error.message
//         );
//         results.failed.push(importProduct.id);
//         results.details.failed.push({
//           productId: importProduct.id,
//           sku: importProduct.sku,
//           reason: "Processing error",
//           error: error.message,
//           suggestion: "Check product data and try again",
//         });
//       }
//     }

//     // Finalize import job
//     const finalStatus =
//       results.failed.length === productsToImport.length
//         ? "failed"
//         : results.successful.length > 0
//         ? "completed"
//         : "partial";

//     await importJob.update({
//       status: finalStatus,
//       completedAt: new Date(),
//     });

//     // Generate failure analysis
//     const failureAnalysis = analyzeFailures(results.details.failed);

//     console.log(
//       `🎉 Import from ProductForImport completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`
//     );

//     // AUTO-CLEANUP
//     let cleanupResults = null;
//     if (autoCleanup && results.failed.length > 0 && brand) {
//       console.log(`🧹 Starting AUTO-CLEANUP for failed ${brand} products...`);
//       cleanupResults = await autoCleanupFailedProducts(
//         brand,
//         results.details.failed
//       );
//     }

//     // Prepare response
//     const response = {
//       success: true,
//       message: `Import completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`,
//       jobId: importJob.id,
//       source: "product_for_import",
//       summary: {
//         total: productsToImport.length,
//         successful: results.successful.length,
//         failed: results.failed.length,
//         skipped: results.skipped.length,
//         successRate:
//           ((results.successful.length / productsToImport.length) * 100).toFixed(
//             2
//           ) + "%",
//       },
//       detailedResults: {
//         failures: results.details.failed.map((f) => ({
//           sku: f.sku,
//           reason: f.reason,
//           error: f.error || null,
//           suggestion: f.suggestion,
//         })),
//         skips: results.details.skipped.map((s) => ({
//           sku: s.sku,
//           reason: s.reason,
//           existingProductId: s.existingProductId,
//         })),
//         successful: results.details.successful.map((s) => ({
//           sku: s.sku,
//           newProductId: s.newProductId,
//         })),
//       },
//       analysis: failureAnalysis,
//       recommendations: generateRecommendations(results),
//     };

//     // Add cleanup results to response if cleanup was performed
//     if (cleanupResults) {
//       response.autoCleanup = cleanupResults;
//       response.message += ` | Auto-cleanup completed: ${cleanupResults.deletionResults.products} products deleted`;
//     }

//     res.status(200).json(response);

//   } catch (error) {
//     console.error(
//       `❌ Error processing product ${importProduct.sku}:`,
//       error.message
//     );
//     results.failed.push(importProduct.id);
//     results.details.failed.push({
//       productId: importProduct.id,
//       sku: importProduct.sku,
//       reason: "Processing error",
//       error: error.message,
//       suggestion: "Check product data and try again",
//     });

//     // ✅ IMPORTANT: Update status to pending for any processing errors
//     await importProduct.update({
//       status: "pending",
//       lastUpdated: new Date(),
//       errorMessage: error.message,
//     });
//   }
// };

// 🆕 AUTO-CLEANUP FUNCTION

exports.importFromProductForImport = async (req, res) => {
  try {
    const {
      count = 10,
      status = "inactive",
      brand,
      distributor,
      autoCleanup = true,
    } = req.body;

    console.log(`🔄 Starting import from ProductForImport table`);
    console.log(
      `📋 Parameters: count=${count}, status=${status}, brand=${brand}, distributor=${distributor}, autoCleanup=${autoCleanup}`
    );

    // Build where clause - IMPORTANT: Only get inactive products
    const whereClause = { status: "inactive" }; // Force inactive only

    if (brand) {
      whereClause.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (distributor) {
      whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
    }

    // Get products from ProductForImport table
    const productsToImport = await ProductForImport.findAll({
      where: whereClause,
      order: [["createdAt", "ASC"]],
      limit: parseInt(count),
    });

    if (productsToImport.length === 0) {
      return res.status(404).json({
        error: "No products found for import with the specified criteria",
        criteria: {
          status,
          brand,
          distributor,
        },
      });
    }

    console.log(`📦 Found ${productsToImport.length} products to import`);

    // Check daily import limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayImports = await ProductImportJob.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    if (todayImports + productsToImport.length > 300) {
      return res.status(400).json({
        error: `Daily import limit exceeded. Today's remaining quota: ${
          300 - todayImports
        } products`,
        requested: productsToImport.length,
        remaining: 300 - todayImports,
      });
    }

    // Create import job for tracking
    const importJob = await ProductImportJob.create({
      totalProducts: productsToImport.length,
      processedProducts: 0,
      successfulImports: 0,
      failedImports: 0,
      status: "processing",
      progress: 0,
      source: "product_for_import",
    });

    // Track detailed results with error information
    const results = {
      successful: [],
      failed: [],
      skipped: [],
      details: {
        successful: [],
        failed: [],
        skipped: [],
      },
    };

    // Process each product sequentially with enhanced error tracking
    for (const [index, importProduct] of productsToImport.entries()) {
      try {
        console.log(
          `🔄 Processing ${index + 1}/${productsToImport.length}: ${
            importProduct.sku
          } - ${importProduct.brand}`
        );

        const productData = {
          productCode: importProduct.sku,
          brand: importProduct.brand,
          price: 0.0,
          quantity: 0,
          index: index,
        };

        // ✅ PASS THE importProduct TO processSingleProduct
        const result = await processSingleProduct(
          productData,
          importJob.id,
          importProduct // This is the key change - pass the importProduct record
        );

        console.log(`📊 Result for ${importProduct.sku}:`, result);

        // ✅ SIMPLIFIED STATUS HANDLING - processSingleProduct now handles status updates
        if (result.status === "success") {
          results.successful.push(importProduct.id);
          results.details.successful.push({
            productId: importProduct.id,
            sku: importProduct.sku,
            newProductId: result.productId,
            message: "Successfully imported to main catalog",
          });
        } else if (result.status === "skipped") {
          results.skipped.push(importProduct.id);
          results.details.skipped.push({
            productId: importProduct.id,
            sku: importProduct.sku,
            reason: result.message || "Product already exists in database",
            existingProductId: result.productId,
          });
        } else {
          results.failed.push(importProduct.id);
          results.details.failed.push({
            productId: importProduct.id,
            sku: importProduct.sku,
            reason: result.error || "Unknown error during import",
            error: result.error,
            suggestion: getFailureSuggestion(result.error),
            importStatus: result.importStatus || "pending", // Track the actual status set
          });
        }

        // Update job progress
        const progress = Math.round(
          ((index + 1) / productsToImport.length) * 100
        );
        await importJob.update({
          processedProducts: index + 1,
          successfulImports: results.successful.length,
          failedImports: results.failed.length,
          progress: progress,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `❌ Error processing product ${importProduct.sku}:`,
          error.message
        );

        // ✅ UPDATE STATUS TO PENDING FOR PROCESSING ERRORS
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: error.message,
        });

        results.failed.push(importProduct.id);
        results.details.failed.push({
          productId: importProduct.id,
          sku: importProduct.sku,
          reason: "Processing error",
          error: error.message,
          suggestion: "Check product data and try again",
          importStatus: "pending",
        });
      }
    }

    // Finalize import job
    const finalStatus =
      results.failed.length === productsToImport.length
        ? "failed"
        : results.successful.length > 0
        ? "completed"
        : "partial";

    await importJob.update({
      status: finalStatus,
      completedAt: new Date(),
    });

    // Generate failure analysis
    const failureAnalysis = analyzeFailures(results.details.failed);

    console.log(
      `🎉 Import from ProductForImport completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`
    );

    // AUTO-CLEANUP
    let cleanupResults = null;
    if (autoCleanup && results.failed.length > 0 && brand) {
      console.log(`🧹 Starting AUTO-CLEANUP for failed ${brand} products...`);
      cleanupResults = await autoCleanupFailedProducts(
        brand,
        results.details.failed
      );
    }

    // Prepare response
    const response = {
      success: true,
      message: `Import completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`,
      jobId: importJob.id,
      source: "product_for_import",
      summary: {
        total: productsToImport.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        successRate:
          ((results.successful.length / productsToImport.length) * 100).toFixed(
            2
          ) + "%",
      },
      detailedResults: {
        failures: results.details.failed.map((f) => ({
          sku: f.sku,
          reason: f.reason,
          error: f.error || null,
          suggestion: f.suggestion,
          currentStatus: f.importStatus || "pending",
        })),
        skips: results.details.skipped.map((s) => ({
          sku: s.sku,
          reason: s.reason,
          existingProductId: s.existingProductId,
        })),
        successful: results.details.successful.map((s) => ({
          sku: s.sku,
          newProductId: s.newProductId,
        })),
      },
      analysis: failureAnalysis,
      recommendations: generateRecommendations(results),
    };

    // Add cleanup results to response if cleanup was performed
    if (cleanupResults) {
      response.autoCleanup = cleanupResults;
      response.message += ` | Auto-cleanup completed: ${cleanupResults.deletionResults.products} products deleted`;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in importFromProductForImport:", error);
    res.status(500).json({
      error: error.message || "Failed to process import from queue",
    });
  }
};

const autoCleanupFailedProducts = async (brand, failedItems) => {
  try {
    console.log(`🧹 Starting automatic cleanup for brand: ${brand}`);
    console.log(`🔍 Failed items to clean: ${failedItems.length}`);

    // Extract SKUs from failed items
    const failedSkus = failedItems.map((item) => item.sku);
    const failedImportIds = failedItems.map((item) => item.productId);

    console.log(`📦 SKUs to clean:`, failedSkus);

    // Find brand record
    const brandRecord = await Brand.findOne({
      where: { title: { [Op.iLike]: `%${brand}%` } },
    });

    if (!brandRecord) {
      console.log(`❌ Brand '${brand}' not found in main database`);
      return { error: `Brand '${brand}' not found` };
    }

    // Find main products that match these SKUs and brand
    const productsToDelete = await Product.findAll({
      where: {
        sku: { [Op.in]: failedSkus },
        brandId: brandRecord.id,
      },
      attributes: ["id", "sku", "title"],
    });

    console.log(`🗑️ Found ${productsToDelete.length} main products to delete`);

    const productIds = productsToDelete.map((p) => p.id);

    // Delete in transaction to ensure data consistency
    const transaction = await db.sequelize.transaction();

    try {
      const deletionResults = {
        productForImport: 0,
        products: 0,
        images: 0,
        techProducts: 0,
        productDocuments: 0,
        productBulletPoints: 0,
        productImportItems: 0,
      };

      // 1. Delete failed imports from ProductForImport table
      deletionResults.productForImport = await ProductForImport.destroy({
        where: { id: { [Op.in]: failedImportIds } },
        transaction,
      });

      // 2. Delete related data from main product tables (if products exist)
      if (productIds.length > 0) {
        deletionResults.images = await Image.destroy({
          where: { productId: { [Op.in]: productIds } },
          transaction,
        });

        deletionResults.techProducts = await TechProduct.destroy({
          where: { productId: { [Op.in]: productIds } },
          transaction,
        });

        deletionResults.productDocuments = await ProductDocument.destroy({
          where: { productId: { [Op.in]: productIds } },
          transaction,
        });

        deletionResults.productBulletPoints = await ProductBulletPoint.destroy({
          where: { productId: { [Op.in]: productIds } },
          transaction,
        });

        // 3. Delete from ProductImportItems
        deletionResults.productImportItems = await ProductImportItem.destroy({
          where: { productCode: { [Op.in]: failedSkus } },
          transaction,
        });

        // 4. Finally delete the main products
        deletionResults.products = await Product.destroy({
          where: { id: { [Op.in]: productIds } },
          transaction,
        });
      }

      await transaction.commit();

      console.log(`✅ Auto-cleanup completed successfully`);
      console.log(`📊 Deletion results:`, deletionResults);

      return {
        success: true,
        message: `Automatically cleaned up ${brand} failed products`,
        brand: brand,
        failedItemsCount: failedItems.length,
        deletionResults: deletionResults,
        deletedProducts: productsToDelete.map((p) => ({
          id: p.id,
          sku: p.sku,
          title: p.title,
        })),
      };
    } catch (transactionError) {
      await transaction.rollback();
      console.error(
        "❌ Transaction error during auto-cleanup:",
        transactionError
      );
      return { error: transactionError.message };
    }
  } catch (error) {
    console.error("❌ Error in autoCleanupFailedProducts:", error);
    return { error: error.message };
  }
};

// Helper function to analyze failure patterns
function analyzeFailures(failedItems) {
  const reasons = {};

  failedItems.forEach((failure) => {
    const reason = failure.reason;
    if (!reasons[reason]) {
      reasons[reason] = 0;
    }
    reasons[reason]++;
  });

  return {
    totalFailures: failedItems.length,
    commonReasons: Object.entries(reasons)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: ((count / failedItems.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.count - a.count),
  };
}

// Helper function to provide suggestions for failures
function getFailureSuggestion(reason) {
  const suggestions = {
    "Product not found in Icecat database (404)":
      "Check if the SKU and brand combination exists in Icecat",
    "Icecat API access forbidden (403)": "Check API credentials or rate limits",
    "Invalid response from Icecat API":
      "Icecat API may be temporarily unavailable",
    "Product already exists in database":
      "Product with same SKU/UPC already in main catalog",
    "Missing required fields": "Check if SKU and Brand are provided",
    "Processing error": "Review product data and try again",
  };

  // Check for partial matches
  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (reason.includes(key) || key.includes(reason)) {
      return suggestion;
    }
  }

  return "Review product data and try again";
}

// Helper function to generate recommendations
function generateRecommendations(results) {
  const recs = [];

  if (results.failed.length > 0) {
    recs.push(
      `Review ${results.failed.length} failed imports for data quality issues`
    );
  }

  if (results.skipped.length > 0) {
    recs.push(`${results.skipped.length} products skipped due to duplicates`);
  }

  const successRate =
    (results.successful.length /
      (results.successful.length + results.failed.length)) *
    100;
  if (successRate < 50 && results.failed.length > 0) {
    recs.push(
      "Low success rate detected. Consider validating data before import"
    );
  }

  if (results.details.failed.some((f) => f.reason.includes("Icecat API"))) {
    recs.push(
      "Icecat API issues detected. Check API credentials and rate limits"
    );
  }

  return recs;
}

// 🚀 QUICK FIX: Activate specific product immediately
exports.activateProductImmediately = async (req, res) => {
  try {
    const { sku, brand, distributor } = req.body;

    if (!sku || !brand) {
      return res.status(400).json({
        error: "SKU and brand are required",
      });
    }

    console.log(`🚀 Activating product: ${sku} - ${brand}`);

    // Find the product in ProductForImport
    const importProduct = await ProductForImport.findOne({
      where: {
        sku: sku,
        brand: brand,
        ...(distributor && { distributor: distributor }),
      },
    });

    if (!importProduct) {
      return res.status(404).json({
        error: `Product not found in import list: ${sku} - ${brand}`,
      });
    }

    // Update status to active immediately
    await importProduct.update({
      status: "active",
      lastUpdated: new Date(),
      activatedAt: new Date(),
    });

    console.log(`✅ IMMEDIATELY ACTIVATED: ${sku} - ${brand}`);

    res.json({
      success: true,
      message: `Product ${sku} activated successfully`,
      product: {
        sku: importProduct.sku,
        brand: importProduct.brand,
        distributor: importProduct.distributor,
        status: "active",
        lastUpdated: importProduct.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error activating product:", error);
    res.status(500).json({
      error: error.message || "Failed to activate product",
    });
  }
};

// Helper function to analyze failure patterns
function analyzeFailures(failedItems) {
  const reasons = {};

  failedItems.forEach((failure) => {
    const reason = failure.reason;
    if (!reasons[reason]) {
      reasons[reason] = 0;
    }
    reasons[reason]++;
  });

  return {
    totalFailures: failedItems.length,
    commonReasons: Object.entries(reasons)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: ((count / failedItems.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.count - a.count),
  };
}

// Helper function to provide suggestions for failures
function getFailureSuggestion(reason) {
  const suggestions = {
    "Product not found in Icecat database (404)":
      "Check if the SKU and brand combination exists in Icecat",
    "Icecat API access forbidden (403)": "Check API credentials or rate limits",
    "Invalid response from Icecat API":
      "Icecat API may be temporarily unavailable",
    "Product already exists in database":
      "Product with same SKU/UPC already in main catalog",
    "Missing required fields": "Check if SKU and Brand are provided",
    "Processing error": "Review product data and try again",
  };

  // Check for partial matches
  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (reason.includes(key) || key.includes(reason)) {
      return suggestion;
    }
  }

  return "Review product data and try again";
}

// Helper function to generate recommendations
function generateRecommendations(results) {
  const recs = [];

  if (results.failed.length > 0) {
    recs.push(
      `Review ${results.failed.length} failed imports for data quality issues`
    );
  }

  if (results.skipped.length > 0) {
    recs.push(`${results.skipped.length} products skipped due to duplicates`);
  }

  const successRate =
    (results.successful.length /
      (results.successful.length + results.failed.length)) *
    100;
  if (successRate < 50 && results.failed.length > 0) {
    recs.push(
      "Low success rate detected. Consider validating data before import"
    );
  }

  if (results.details.failed.some((f) => f.reason.includes("Icecat API"))) {
    recs.push(
      "Icecat API issues detected. Check API credentials and rate limits"
    );
  }

  return recs;
}

// 📌 Get products available for import (from ProductForImport table)
exports.getProductsForImport = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "inactive",
      brand,
      distributor,
    } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { status: status };

    if (brand) {
      whereClause.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (distributor) {
      whereClause.distributor = { [Op.iLike]: `%${distributor}%` };
    }

    const { count, rows } = await ProductForImport.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
        currentStatus: status,
      },
      summary: {
        availableForImport: count,
        status: status,
        filters: {
          brand: brand || "any",
          distributor: distributor || "any",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products for import:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch products for import",
    });
  }
};

exports.importProduct = async (req, res) => {
  console.log("Import product request received:", req.body);

  try {
    const { productCode, brand } = req.body;

    if (!productCode || !brand) {
      return res.status(400).json({
        error: "Product code and brand are required",
      });
    }

    // First, check if this product exists in ProductForImport table
    const importProduct = await ProductForImport.findOne({
      where: {
        sku: productCode,
        brand: brand,
      },
    });

    const response = await axios.get("https://live.icecat.biz/api/", {
      params: {
        shopname: "vcloudchoice",
        lang: "en",
        Brand: brand,
        ProductCode: productCode,
        app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf",
      },
      validateStatus: function (status) {
        return status < 500;
      },
    });

    // ✅ Handle 404 response - Product not found in Icecat
    if (response.status === 404) {
      console.log(
        `❌ Product not found in Icecat database: ${productCode} - ${brand}`
      );

      if (importProduct) {
        // Update the status to 'pending' when product is not found
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: "Product not found in Icecat database (404)",
        });
        console.log(
          `🔄 Updated ${productCode} status to PENDING in ProductForImport`
        );
      }

      return res.status(404).json({
        error: "The requested product is not present in the Icecat database",
        status: "pending",
        message: "Product marked as pending for manual review",
        productCode,
        brand,
      });
    }

    // Extract UPC only
    const upc = extractUPC(response.data);

    // Ensure brand exists
    let brandRecord = await Brand.findOne({ where: { title: brand } });
    if (!brandRecord) {
      brandRecord = await Brand.create({ title: brand });
    }

    // ✅ CHECK FOR EXISTING PRODUCT
    const existingProduct = await findExistingProduct(
      productCode,
      brandRecord.id,
      upc,
      response.data
    );
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

    // ✅ FIXED CATEGORY HANDLING
    const categoryName = response.data.data?.GeneralInfo?.Category?.Name?.Value;

    // Ensure we have a valid category
    let category;
    try {
      category = await ensureCategoryExists(1);
    } catch (error) {
      return res.status(500).json({
        error: `Category error: ${error.message}`,
      });
    }

    let subCategory = await SubCategory.findOne({
      where: { title: categoryName },
    });
    if (!subCategory) {
      subCategory = await SubCategory.create({
        title: categoryName || "Uncategorized",
        parentId: category.id,
      });
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
      categoryId: category.id,
      subCategoryId: subCategory.id,
    };

    if (existingProduct) {
      // ✅ UPDATE EXISTING PRODUCT
      isUpdate = true;

      // Clean up old assets
      await cleanupProductAssets(existingProduct.id);

      // Update the product
      product = await updateExistingProduct(
        existingProduct,
        productData,
        mainImageFilename
      );
      console.log(`🔄 Updated existing product: ${product.title}`);
    } else {
      // ✅ CREATE NEW PRODUCT
      product = await Product.create(productData);
      console.log(`🆕 Created new product: ${product.title}`);
    }

    // ✅ UPDATE STATUS TO 'active' SINCE PRODUCT WAS SUCCESSFULLY PROCESSED
    if (importProduct) {
      await importProduct.update({
        status: "active",
        lastUpdated: new Date(),
        mainProductId: product.id,
      });
      console.log(
        `✅ Updated ${productCode} status to ACTIVE in ProductForImport`
      );
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

        const downloadedFilename = await downloadImage(
          imgUrl,
          galleryImageFilename
        );

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
            where: { title: group.FeatureGroup?.Name?.Value },
          });

          if (!techSpecGroup) {
            techSpecGroup = await TechSpecGroup.create({
              title: group.FeatureGroup?.Name?.Value || "General",
            });
          }

          for (const feature of group.Features || []) {
            let techProductName = await TechProductName.findOne({
              where: { title: feature.Feature?.Name?.Value },
            });

            if (!techProductName) {
              techProductName = await TechProductName.create({
                title: feature.Feature?.Name?.Value || "Unknown",
              });
            }

            await TechProduct.create({
              specId: techProductName.id,
              value:
                feature.PresentationValue ||
                feature.RawValue ||
                feature.Value ||
                "",
              techspecgroupId: techSpecGroup.id,
              productId: product.id,
            });
          }
        }
      }

      console.log(
        `✅ Successfully processed tech specs for product ID: ${product.id}`
      );
    } catch (error) {
      console.error("❌ Error processing Icecat data:", error);
    }

    res.status(201).json({
      message: isUpdate
        ? "Product updated successfully"
        : "Product imported successfully",
      action: isUpdate ? "updated" : "created",
      product: {
        id: product.id,
        title: product.title,
        sku: product.sku,
        upc: product.upcCode,
        brand: brandRecord.title,
        existingProductUpdated: isUpdate,
        documentsCount: multimediaData ? multimediaData.length : 0,
        bulletPointsCount: generatedBulletPoints
          ? generatedBulletPoints.Values.length
          : 0,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error importing/updating product:",
      error.response?.data || error.message
    );

    // ✅ Handle 404 errors specifically
    if (error.response?.status === 404) {
      // Find and update the product in ProductForImport table
      const importProduct = await ProductForImport.findOne({
        where: {
          sku: req.body.productCode,
          brand: req.body.brand,
        },
      });

      if (importProduct) {
        await importProduct.update({
          status: "pending",
          lastUpdated: new Date(),
          errorMessage: "Product not found in Icecat database (404)",
        });
      }

      return res.status(404).json({
        error: "The requested product is not present in the Icecat database",
        status: "pending",
        message: "Product marked as pending for manual review",
        productCode: req.body.productCode,
        brand: req.body.brand,
      });
    }

    // Handle other errors by setting status to 'pending'
    const importProduct = await ProductForImport.findOne({
      where: {
        sku: req.body.productCode,
        brand: req.body.brand,
      },
    });

    if (importProduct) {
      await importProduct.update({
        status: "pending",
        lastUpdated: new Date(),
        errorMessage: error.message,
      });
    }

    res.status(500).json({
      error:
        error.response?.data?.message ||
        error.message ||
        "Internal server error during import",
    });
  }
};

exports.bulkImportProducts = async (req, res) => {
  console.log("Bulk import products request received:", req.body);

  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products array is required and must not be empty",
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
          [Op.lt]: tomorrow,
        },
      },
    });

    if (todayImports + products.length > 300) {
      return res.status(400).json({
        error: `Daily import limit exceeded. Today's remaining quota: ${
          300 - todayImports
        } products`,
      });
    }

    // Validate each product in the array
    const validProducts = [];
    const errors = [];

    for (const [index, product] of products.entries()) {
      if (!product.productCode || !product.brand) {
        errors.push(
          `Product at index ${index}: Product Code and Brand are required`
        );
        continue;
      }

      // Check for duplicates in the current batch
      const duplicateInBatch = validProducts.find(
        (p) =>
          p.productCode === product.productCode.trim() &&
          p.brand === product.brand.trim()
      );

      if (duplicateInBatch) {
        errors.push(
          `Product at index ${index}: Duplicate combination (Product Code: ${product.productCode}, Brand: ${product.brand}) in batch`
        );
        continue;
      }

      validProducts.push({
        productCode: product.productCode.trim(),
        brand: product.brand.trim(),
        price: product.price ? parseFloat(product.price) : 0.0,
        quantity: product.quantity ? parseInt(product.quantity) : 0,
        index: index,
      });
    }

    if (validProducts.length === 0) {
      return res.status(400).json({
        error: "No valid products to import",
        details: errors,
      });
    }

    console.log(`🔄 Starting bulk import of ${validProducts.length} products`);

    // Create import job for tracking
    const importJob = await ProductImportJob.create({
      totalProducts: validProducts.length,
      processedProducts: 0,
      successfulImports: 0,
      failedImports: 0,
      status: "processing",
      progress: 0,
    });

    // Process products sequentially to avoid overwhelming the Icecat API
    const results = {
      successful: [],
      failed: [],
      skipped: [],
    };

    for (const [index, productData] of validProducts.entries()) {
      try {
        console.log(
          `📦 Processing product ${index + 1}/${validProducts.length}: ${
            productData.productCode
          } - ${productData.brand}`
        );

        const result = await processSingleProduct(productData, importJob.id);

        if (result.status === "success") {
          results.successful.push(result);
        } else if (result.status === "skipped") {
          results.skipped.push(result);
        } else {
          results.failed.push(result);
        }

        // Update job progress
        const progress = Math.round(((index + 1) / validProducts.length) * 100);
        await importJob.update({
          processedProducts: index + 1,
          successfulImports: results.successful.length,
          failedImports: results.failed.length,
          progress: progress,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `❌ Error processing product ${productData.productCode}:`,
          error.message
        );
        results.failed.push({
          productCode: productData.productCode,
          brand: productData.brand,
          error: error.message,
          status: "failed",
        });
      }
    }

    // Finalize import job
    const finalStatus =
      results.failed.length === validProducts.length
        ? "failed"
        : results.successful.length > 0
        ? "completed"
        : "partial";

    await importJob.update({
      status: finalStatus,
      completedAt: new Date(),
    });

    console.log(
      `🎉 Bulk import completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`
    );

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`,
      jobId: importJob.id,
      results: {
        total: validProducts.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        details: {
          successful: results.successful.slice(0, 10),
          failed: results.failed.slice(0, 10),
          skipped: results.skipped.slice(0, 10),
        },
      },
      importJob: {
        id: importJob.id,
        status: importJob.status,
        progress: importJob.progress,
      },
    });
  } catch (error) {
    console.error("❌ Error in bulk import:", error);
    res.status(500).json({
      error: error.message || "Failed to process bulk import",
    });
  }
};

exports.getBulkImportStatus = async (req, res) => {
  try {
    const job = await ProductImportJob.findByPk(req.params.jobId, {
      include: [
        {
          model: ProductImportItem,
          as: "items",
          order: [["orderIndex", "ASC"]],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({
        error: "Import job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to fetch bulk import status",
    });
  }
};

exports.getimportsProducts = async (req, res) => {
  try {
    // Get all products imported from Icecat
    const importedProducts = await Product.findAll({
      where: {
        productSource: "icecat",
      },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      message: "Imported products retrieved successfully",
      data: importedProducts,
    });
  } catch (err) {
    console.error("Error in getimportsProducts:", err);
    res.status(500).json({
      error: err.message || "Internal server error fetching imports",
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
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);

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
          price: req.body.price ? parseFloat(req.body.price) : 0.0,
          quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
          brandId: req.body.brandId || null,
          categoryId: req.body.categoryId || null,
          subCategoryId: req.body.subCategoryId || null,
        };

        // Validation
        if (!productData.sku) {
          return res.status(400).json({ error: "SKU is required" });
        }
        if (!productData.title) {
          return res.status(400).json({ error: "Title is required" });
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

        console.log("Product data to create:", productData);

        // Create product
        const product = await Product.create(productData);

        // Handle detail images
        if (req.files?.detailImages) {
          const imagePromises = req.files.detailImages.map(async (file) => {
            await Image.create({
              imageTitle: file.originalname,
              url: file.filename,
              productId: product.id,
            });
          });
          await Promise.all(imagePromises);
        }

        // Fetch the complete product with relations
        const productWithRelations = await Product.findByPk(product.id, {
          include: [
            { model: Brand, as: "brand" },
            { model: Category, as: "category" },
            { model: SubCategory, as: "subCategory" },
            { model: Image, as: "images" },
          ],
        });

        res.status(201).json(productWithRelations);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
        { model: SubCategory, as: "subCategory" },
        { model: Image, as: "images" },
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
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
        { model: SubCategory, as: "subCategory" },
        { model: Image, as: "images" },
        { model: db.ProductDocument, as: "documents" },
        {
          model: db.ProductBulletPoint,
          as: "bulletPoints",
          order: [["orderIndex", "ASC"]],
        },
      ],
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
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
        if (!product)
          return res.status(404).json({ error: "Product not found" });

        const updateData = { ...req.body };

        // Handle numeric fields
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.quantity)
          updateData.quantity = parseInt(updateData.quantity);

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
              productId: product.id,
            });
          });
          await Promise.all(imagePromises);
        }

        const updatedProduct = await Product.findByPk(req.params.id, {
          include: [
            { model: Brand, as: "brand" },
            { model: Category, as: "category" },
            { model: SubCategory, as: "subCategory" },
            { model: Image, as: "images" },
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
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete associated images
    await Image.destroy({ where: { productId: product.id } });

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Improved subcategory handling
const ensureSubCategoryExists = async (categoryName, categoryId) => {
  try {
    if (!categoryName) {
      // If no category name provided, create/use default subcategory
      let defaultSubCategory = await SubCategory.findOne({
        where: { title: "Uncategorized" },
      });

      if (!defaultSubCategory) {
        defaultSubCategory = await SubCategory.create({
          title: "Uncategorized",
          parentId: categoryId,
        });
      }
      return defaultSubCategory;
    }

    let subCategory = await SubCategory.findOne({
      where: {
        title: categoryName,
        parentId: categoryId,
      },
    });

    if (!subCategory) {
      subCategory = await SubCategory.create({
        title: categoryName,
        parentId: categoryId,
      });
    }

    return subCategory;
  } catch (error) {
    console.error("Error ensuring subcategory exists:", error);
    // Fallback to default subcategory
    const fallbackSubCategory =
      (await SubCategory.findOne({
        where: { title: "Uncategorized" },
      })) ||
      (await SubCategory.create({
        title: "Uncategorized",
        parentId: categoryId,
      }));
    return fallbackSubCategory;
  }
};
