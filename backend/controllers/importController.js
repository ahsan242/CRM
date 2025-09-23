// const db = require("../config/db");
// const Product = db.Product;
// const Brand = db.Brand;
// const Image = db.Image;
// const axios = require("axios");
// const path = require("path");
// const fs = require("fs");

// const TechSpecGroup = db.TechSpecGroup;
// const TechProductName = db.TechProductName;
// const TechProduct = db.TechProduct;
// const SubCategorys = db.SubCategory;

// // 📌 Helper function: download image to uploads folder
// const downloadImage = async (url, filename) => {
//   try {
//     const response = await axios({
//       url: url,
//       method: "GET",
//       responseType: "stream",
//     });

//     const uploadsDir = path.join(__dirname, "..", "uploads", "products");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }
//     const ext = path.extname(url).split("?")[0] || ".jpg";

//     const filePath = path.join(uploadsDir, filename);

//     // Save file
//     const writer = fs.createWriteStream(filePath);
//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });

//     console.log("✅ Image saved:", filePath);

//     return filePath;
//   } catch (error) {
//     console.error("❌ Error downloading image:", error.message);
//     return null;
//   }
// };

// // 📌 Helper function: Extract UPC from Icecat response
// const extractUPC = (icecatData) => {
//   try {
//     const generalInfo = icecatData.data?.GeneralInfo;
    
//     // Method 1: Direct UPC field
//     if (generalInfo?.UPC) {
//       return generalInfo.UPC;
//     }

//     // Method 2: Check in technical specifications for UPC
//     // const featuresGroups = icecatData.data?.FeaturesGroups;
//     // if (featuresGroups && Array.isArray(featuresGroups)) {
//     //   for (const group of featuresGroups) {
//     //     for (const feature of group.Features || []) {
//     //       const featureName = feature.Feature?.Name?.Value?.toLowerCase();
//     //       const featureValue = feature.PresentationValue || feature.RawValue || feature.Value;
          
//     //       if (featureName && featureValue) {
//     //         if (featureName.includes('upc') || featureName.includes('universal product code')) {
//     //           return featureValue;
//     //         }
//     //       }
//     //     }
//     //   }
//     // }

//     // Method 3: Check GTIN if it's 12 digits (UPC length)
//     if (generalInfo?.GTIN && generalInfo.GTIN.length === 12) {
//       return generalInfo.GTIN;
//     }

//     console.log("📦 Extracted UPC:", generalInfo?.UPC || "Not found");
//     return generalInfo?.UPC || null;

//   } catch (error) {
//     console.error("❌ Error extracting UPC:", error);
//     return null;
//   }
// };

// exports.importProduct = async (req, res) => {
//   console.log("Import product request received:", req.body);

//   try {
//     const { productCode, brand } = req.body;

//     if (!productCode || !brand) {
//       return res.status(400).json({
//         error: "Product code and brand are required",
//       });
//     }

//     const response = await axios.get("https://live.icecat.biz/api/", {
//       params: {
//         shopname: "vcloudchoice",
//         lang: "en",
//         Brand: brand,
//         ProductCode: productCode,
//         app_key: "HhFakMaKzZsHF3fb6O_VUXzMNoky7Xpf",
//       },
//     });

//     // Extract UPC only
//     const upc = extractUPC(response.data);

//     // Ensure brand exists
//     let brandRecord = await Brand.findOne({ where: { title: brand } });
//     if (!brandRecord) {
//       brandRecord = await Brand.create({ title: brand });
//     }

//     const ImageUrl = response.data.data.Image;
//     const mainImageUrl = ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;
    
//     // ✅ FIX: Declare variables properly
//     let mainImageFilename = null;
//     let downloadedFilename = null;

//     if (mainImageUrl) {
//       const timestamp = Date.now();
//       const imageExt = path.extname(mainImageUrl) || ".jpg";
//       mainImageFilename = `icecat_${productCode}_main_${timestamp}${imageExt}`;

//       downloadedFilename = await downloadImage(mainImageUrl, mainImageFilename);
//     }

//     const Category = response.data.data.GeneralInfo.Category.Name.Value;
//     let SubCategory = await SubCategorys.findOne({ where: { title: Category } });
//     if (!SubCategory) {
//       SubCategory = await SubCategorys.create({ title: Category, parentId: 1 });
//     }
    
//     const generalInfo = response.data.data.GeneralInfo;

//     // ✅ FIX: Use the extracted UPC variable instead of generalInfo?.GTIN
//     const productData = {
//       sku: productCode,
//       mfr: productCode,
//       techPartNo: null,
//       shortDescp: generalInfo?.Title || null,
//       longDescp: generalInfo?.Description?.LongDesc || null,
//       metaTitle: generalInfo?.Title || null,
//       metaDescp: generalInfo?.Description?.LongDesc || null,
//       upcCode: upc || "Null", // ✅ CORRECTED: Use the extracted UPC
//       productSource: "icecat",
//       userId: 1,
//       mainImage: mainImageFilename || null,
//       title: generalInfo?.ProductName || generalInfo?.Title || productCode,
//       price: req.body.price ? parseFloat(req.body.price) : 0.0,
//       quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
//       brandId: brandRecord.id,
//       categoryId: 1,
//       subCategoryId: SubCategory.id,
//     };

//     // 1️⃣ Create product
//     const product = await Product.create(productData);
    
//     const gallery = response.data.data.Gallery;

//     if (gallery && Array.isArray(gallery)) {
//       for (const [index, img] of gallery.entries()) {
//         const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;

//         if (!imgUrl) continue;
        
//         const timestamp = Date.now();
//         const imageExt = path.extname(imgUrl) || ".jpg";
//         // ✅ FIX: Use different variable name for gallery images
//         const galleryImageFilename = `icecat_${productCode}_gallery_${index}_${timestamp}${imageExt}`;

//         downloadedFilename = await downloadImage(imgUrl, galleryImageFilename);
        
//         if (downloadedFilename) {
//           await Image.create({
//             imageTitle: `Image ${index + 1}`,
//             url: galleryImageFilename,
//             productId: product.id,
//           });
//           console.log(`✅ Image ${index + 1} associated with product`);
//         }
//       }
//     }

//     // Process technical specifications
//     try {
//       const featuresGroups = response.data.data.FeaturesGroups;
      
//       for (const group of featuresGroups) {
//         // Step 1: Process TechSpecGroup (if not exists, create and get id)
//         let techSpecGroup = await TechSpecGroup.findOne({
//           where: { title: group.FeatureGroup.Name.Value }
//         });
        
//         if (!techSpecGroup) {
//           techSpecGroup = await TechSpecGroup.create({
//             title: group.FeatureGroup.Name.Value
//           });
//         }
        
//         // Step 2: Process each feature in the group
//         for (const feature of group.Features) {
//           // Process TechProductName (if not exists, create and get id)
//           let techProductName = await TechProductName.findOne({
//             where: { title: feature.Feature.Name.Value }
//           });
          
//           if (!techProductName) {
//             techProductName = await TechProductName.create({
//               title: feature.Feature.Name.Value
//             });
//           }
          
//           // Step 3: Create TechProduct record
//           await TechProduct.create({
//             specId: techProductName.id,
//             value: feature.PresentationValue || feature.RawValue || feature.Value,
//             techspecgroupId: techSpecGroup.id,
//             productId: product.id
//           });
//         }
//       }
      
//       console.log(`✅ Successfully processed tech specs for product ID: ${product.id}`);
      
//     } catch (error) {
//       console.error('❌ Error processing Icecat data:', error);
//       // ✅ FIX: Don't throw error here - continue with product creation
//       // Just log the error but don't break the whole import process
//     }

//     res.status(201).json({
//       message: "Product imported successfully with UPC handling",
//       product: {
//         id: product.id,
//         title: product.title,
//         sku: product.sku,
//         upc: product.upcCode,
//         brand: brandRecord.title
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Error importing product:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       error: error.response?.data || error.message,
//     });
//   }
// };

// exports.getimportsProducts = async (req, res) => {
//   try {
//     console.log("Get imports request received");

//     // This would typically return a list of imported products
//     // For testing, return a mock response
//     res.status(200).json({
//       message: "Imported products retrieved successfully",
//       data: [
//         {
//           id: 1,
//           productCode: "E500-G.APSMB1",
//           brand: "LG",
//           status: "completed",
//           importedAt: new Date().toISOString(),
//         },
//         {
//           id: 2,
//           productCode: "TEST123",
//           brand: "HP",
//           status: "processing",
//           importedAt: new Date().toISOString(),
//         },
//       ],
//     });
//   } catch (err) {
//     console.error("Error in getimportsProducts:", err);
//     res.status(500).json({
//       error: err.message || "Internal server error fetching imports",
//     });
//   }
// };

//........... redundand data handeling and update existing product if found || create product..............

const db = require("../config/db");
const Product = db.Product;
const Brand = db.Brand;
const Image = db.Image;
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const TechSpecGroup = db.TechSpecGroup;
const TechProductName = db.TechProductName;
const TechProduct = db.TechProduct;
const SubCategorys = db.SubCategory;

// 📌 Helper function: download image to uploads folder
const downloadImage = async (url, filename) => {
  try {
    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
    });

    const uploadsDir = path.join(__dirname, "..", "uploads", "products");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(url).split("?")[0] || ".jpg";

    const filePath = path.join(uploadsDir, filename);

    // Save file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ Image saved:", filePath);

    return filePath;
  } catch (error) {
    console.error("❌ Error downloading image:", error.message);
    return null;
  }
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
const findExistingProduct = async (productCode, brandId, upc) => {
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
    const generalInfo = icecatData.data?.GeneralInfo;
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

    return true;
  } catch (error) {
    console.error("❌ Error cleaning up product assets:", error);
    // Don't throw error - continue with import
    return false;
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
    const existingProduct = await findExistingProduct(productCode, brandRecord.id, upc);
    let isUpdate = false;
    let product;

    const ImageUrl = response.data.data.Image;
    const mainImageUrl = ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;
    
    let mainImageFilename = null;
    let downloadedFilename = null;

    if (mainImageUrl) {
      const timestamp = Date.now();
      const imageExt = path.extname(mainImageUrl) || ".jpg";
      mainImageFilename = `icecat_${productCode}_main_${timestamp}${imageExt}`;
      downloadedFilename = await downloadImage(mainImageUrl, mainImageFilename);
    }

    const Category = response.data.data.GeneralInfo.Category.Name.Value;
    let SubCategory = await SubCategorys.findOne({ where: { title: Category } });
    if (!SubCategory) {
      SubCategory = await SubCategorys.create({ title: Category, parentId: 1 });
    }
    
    const generalInfo = response.data.data.GeneralInfo;

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
      
      // Clean up old assets (images and tech specs)
      await cleanupProductAssets(existingProduct.id);
      
      // Update the product
      product = await updateExistingProduct(existingProduct, productData, mainImageFilename);
      console.log(`🔄 Updated existing product: ${product.title}`);
    } else {
      // ✅ CREATE NEW PRODUCT
      product = await Product.create(productData);
      console.log(`🆕 Created new product: ${product.title}`);
    }
    
    // Process gallery images
    const gallery = response.data.data.Gallery;
    if (gallery && Array.isArray(gallery)) {
      for (const [index, img] of gallery.entries()) {
        const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;
        if (!imgUrl) continue;
        
        const timestamp = Date.now();
        const imageExt = path.extname(imgUrl) || ".jpg";
        const galleryImageFilename = `icecat_${productCode}_gallery_${index}_${timestamp}${imageExt}`;

        downloadedFilename = await downloadImage(imgUrl, galleryImageFilename);
        
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
      const featuresGroups = response.data.data.FeaturesGroups;
      
      for (const group of featuresGroups) {
        let techSpecGroup = await TechSpecGroup.findOne({
          where: { title: group.FeatureGroup.Name.Value }
        });
        
        if (!techSpecGroup) {
          techSpecGroup = await TechSpecGroup.create({
            title: group.FeatureGroup.Name.Value
          });
        }
        
        for (const feature of group.Features) {
          let techProductName = await TechProductName.findOne({
            where: { title: feature.Feature.Name.Value }
          });
          
          if (!techProductName) {
            techProductName = await TechProductName.create({
              title: feature.Feature.Name.Value
            });
          }
          
          await TechProduct.create({
            specId: techProductName.id,
            value: feature.PresentationValue || feature.RawValue || feature.Value,
            techspecgroupId: techSpecGroup.id,
            productId: product.id
          });
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
        existingProductUpdated: isUpdate
      },
    });
  } catch (error) {
    console.error(
      "❌ Error importing/updating product:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

exports.getimportsProducts = async (req, res) => {
  try {
    console.log("Get imports request received");

    // This would typically return a list of imported products
    // For testing, return a mock response
    res.status(200).json({
      message: "Imported products retrieved successfully",
      data: [
        {
          id: 1,
          productCode: "E500-G.APSMB1",
          brand: "LG",
          status: "completed",
          action: "created", // or "updated"
          importedAt: new Date().toISOString(),
        },
        {
          id: 2,
          productCode: "TEST123",
          brand: "HP",
          status: "processing",
          action: "updated", // or "created"
          importedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (err) {
    console.error("Error in getimportsProducts:", err);
    res.status(500).json({
      error: err.message || "Internal server error fetching imports",
    });
  }
};