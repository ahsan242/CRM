
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
const processProductDocuments = db.ProductDocument;

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

// 📌 Helper function: download multimedia file to uploads folder
const downloadMultimedia = async (url, filename) => {
  try {
    const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
      timeout: 30000,
    });

    const multimediaDir = path.join(__dirname, "..", "uploads", "multimedia");
    if (!fs.existsSync(multimediaDir)) {
      fs.mkdirSync(multimediaDir, { recursive: true });
    }

    // Get file extension from URL or content type
    let ext = path.extname(url.split('?')[0]);
    if (!ext) {
      // Try to determine extension from content type
      const contentType = response.headers['content-type'];
      if (contentType) {
        if (contentType.includes('pdf')) ext = '.pdf';
        else if (contentType.includes('video')) ext = '.mp4';
        else if (contentType.includes('zip')) ext = '.zip';
        else if (contentType.includes('msword')) ext = '.doc';
        else if (contentType.includes('wordprocessingml')) ext = '.docx';
        else ext = '.bin';
      } else {
        ext = '.bin';
      }
    }

    const finalFilename = filename + ext;
    const filePath = path.join(multimediaDir, finalFilename);

    // Save file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ Multimedia file saved:", finalFilename);
    return finalFilename;

  } catch (error) {
    console.error("❌ Error downloading multimedia file:", error.message);
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

// 📌 Helper function: Extract EndOfLifeDate from Icecat response
const extractEndOfLifeDate = (icecatData) => {
  try {
    const generalInfo = icecatData.data?.GeneralInfo;
    const endOfLifeDate = generalInfo?.EndOfLifeDate;
    
    if (endOfLifeDate) {
      console.log("📦 Extracted EndOfLifeDate:", endOfLifeDate);
      // Convert "30-05-2008" format to JavaScript Date object
      const [day, month, year] = endOfLifeDate.split('-');
      const dateObject = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(dateObject.getTime())) {
        return dateObject;
      }
    }
    
    console.log("📦 No valid EndOfLifeDate found");
    return null;
  } catch (error) {
    console.error("❌ Error extracting EndOfLifeDate:", error);
    return null;
  }
};

// 📌 Helper function: Extract Multimedia URLs from Icecat response and download files
const extractAndDownloadMultimedia = async (icecatData, productCode) => {
  try {
    const multimedia = icecatData.data?.Multimedia;
    console.log("📦 Raw Multimedia Data:", multimedia);
    
    if (!multimedia) {
      console.log("📦 No multimedia found in Icecat response");
      return null;
    }

    let downloadedFiles = [];

    if (Array.isArray(multimedia)) {
      // Handle array of multimedia objects
      for (const [index, item] of multimedia.entries()) {
        const url = item.URL || item.Url;
        if (url) {
          const timestamp = Date.now();
          const baseFilename = `icecat_${productCode}_media_${index}_${timestamp}`;
          const downloadedFilename = await downloadMultimedia(url, baseFilename);
          
          if (downloadedFilename) {
            downloadedFiles.push({
              filename: downloadedFilename,
              originalUrl: url,
              type: item.Type || 'multimedia'
            });
          }
        }
      }
    } else if (multimedia.URL || multimedia.Url) {
      // Handle single multimedia object
      const url = multimedia.URL || multimedia.Url;
      const timestamp = Date.now();
      const baseFilename = `icecat_${productCode}_media_${timestamp}`;
      const downloadedFilename = await downloadMultimedia(url, baseFilename);
      
      if (downloadedFilename) {
        downloadedFiles.push({
          filename: downloadedFilename,
          originalUrl: url,
          type: multimedia.Type || 'multimedia'
        });
      }
    }

    // Return only the first filename for multimediaUrl field (or comma separated if multiple)
    const filenames = downloadedFiles.map(file => file.filename);
    const result = filenames.length > 0 ? filenames.join(',') : null;
    
    console.log("📦 Downloaded Multimedia Files:", downloadedFiles);
    console.log("📦 MultimediaUrl field value:", result);
    
    return {
      multimediaUrl: result, // Just the filename(s)
      multimediaFiles: downloadedFiles // Full info for documents table
    };

  } catch (error) {
    console.error("❌ Error extracting and downloading multimedia:", error);
    return { multimediaUrl: null, multimediaFiles: [] };
  }
};

// 📌 Helper function: Check if product already exists
const findExistingProduct = async (productCode, brandId, upc) => {
  try {
    // Check by SKU and brand combination (most reliable)
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

    // Check by UPC if available
    if (upc && upc !== "Null") {
      const productByUpc = await Product.findOne({
        where: { upcCode: upc },
      });

      if (productByUpc) {
        console.log(`✅ Found existing product by UPC: ${upc}`);
        return productByUpc;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding existing product:", error);
    return null;
  }
};

// 📌 Helper function: Update existing product
const updateExistingProduct = async (
  existingProduct,
  productData,
  newMainImage
) => {
  try {
    // Preserve the existing main image if no new one is provided
    if (!newMainImage) {
      productData.mainImage = existingProduct.mainImage;
    }

    // Update the product
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
    await db.ProductDocument.destroy({ where: { productId } });
    console.log(`✅ Cleared existing documents for product ID: ${productId}`);

    // Delete existing bullet points
    await db.ProductBulletPoint.destroy({ where: { productId } });
    console.log(
      `✅ Cleared existing bullet points for product ID: ${productId}`
    );

  } catch (error) {
    console.error("❌ Error cleaning up product assets:", error);
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

    // ✅ EXTRACT AND DOWNLOAD MULTIMEDIA FILES
    const multimediaResult = await extractAndDownloadMultimedia(response.data, productCode);
    const multimediaUrl = multimediaResult.multimediaUrl; // Just the filename(s)
    const multimediaFiles = multimediaResult.multimediaFiles; // Full info for documents

    // Extract UPC only
    const upc = extractUPC(response.data);
    
    // ✅ EXTRACT END OF LIFE DATE
    const endOfLifeDate = extractEndOfLifeDate(response.data);

    // Ensure brand exists
    let brandRecord = await Brand.findOne({ where: { title: brand } });
    if (!brandRecord) {
      brandRecord = await Brand.create({ title: brand });
    }

    // ✅ CHECK FOR EXISTING PRODUCT
    const existingProduct = await findExistingProduct(
      productCode,
      brandRecord.id,
      upc
    );
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
    let SubCategory = await SubCategorys.findOne({
      where: { title: Category },
    });
    if (!SubCategory) {
      SubCategory = await SubCategorys.create({ title: Category, parentId: 1 });
    }

    const generateBulletPoints =
      response.data.data.GeneralInfo.GeneratedBulletPoints;
    console.log("Generated Bullet Points:", generateBulletPoints);
    let bulletHtml = "";

    if (generateBulletPoints && Array.isArray(generateBulletPoints.Values)) {
      bulletHtml =
        "<ul>\n" +
        generateBulletPoints.Values.map((point) => `  <li>${point}</li>`).join(
          "\n"
        ) +
        "\n</ul>";
    } else {
      bulletHtml = "<ul></ul>";
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
      multimediaUrl: multimediaUrl, // Now just the filename(s) like "icecat_M378A1K43CB2-CTD_media_0_1758653596519.pdf"
      productSource: "icecat",
      userId: 1,
      mainImage: mainImageFilename || null,
      title: generalInfo?.ProductName || generalInfo?.Title || productCode,
      price: req.body.price ? parseFloat(req.body.price) : 0.0,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
      brandId: brandRecord.id,
      bulletsPoint: bulletHtml,
      categoryId: 1,
      subCategoryId: SubCategory.id,
      endOfLifeDate: endOfLifeDate, // ✅ NEW FIELD ADDED
    };

    if (existingProduct) {
      // ✅ UPDATE EXISTING PRODUCT
      isUpdate = true;

      // Clean up old assets (images and tech specs)
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

    // ✅ PROCESS MULTIMEDIA DOCUMENTS (with local file paths)
    if (multimediaFiles.length > 0) {
      try {
        for (const media of multimediaFiles) {
          if (media.filename) {
            await db.ProductDocument.create({
              productId: product.id,
              documentUrl: `/uploads/multimedia/${media.filename}`, // Local path
              originalUrl: media.originalUrl, // Keep original URL for reference
              documentType: media.type || 'multimedia',
              title: `Media for ${productCode}`,
              fileName: media.filename
            });
          }
        }
        console.log(`✅ Processed ${multimediaFiles.length} multimedia files locally`);
      } catch (error) {
        console.error("❌ Error processing multimedia documents:", error);
      }
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
          where: { title: group.FeatureGroup.Name.Value },
        });

        if (!techSpecGroup) {
          techSpecGroup = await TechSpecGroup.create({
            title: group.FeatureGroup.Name.Value,
          });
        }

        for (const feature of group.Features) {
          let techProductName = await TechProductName.findOne({
            where: { title: feature.Feature.Name.Value },
          });

          if (!techProductName) {
            techProductName = await TechProductName.create({
              title: feature.Feature.Name.Value,
            });
          }

          await TechProduct.create({
            specId: techProductName.id,
            value:
              feature.PresentationValue || feature.RawValue || feature.Value,
            techspecgroupId: techSpecGroup.id,
            productId: product.id,
          });
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
        multimediaUrl: product.multimediaUrl, // Now shows just the filename
        brand: brandRecord.title,
        existingProductUpdated: isUpdate,
        documentsCount: multimediaFiles.length,
        endOfLifeDate: product.endOfLifeDate // ✅ INCLUDED IN RESPONSE
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