const db = require("../config/db");
const Product = db.Product;
const Brand = db.Brand;
const Image = db.Image;
const axios = require("axios");
const path = require("path");
const fs = require("fs");

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

    // Ensure brand exists
    let brandRecord = await Brand.findOne({ where: { title: brand } });
    if (!brandRecord) {
      brandRecord = await Brand.create({ title: brand });
    }

    const ImageUrl = response.data.data.Image;
    const mainImageUrl =
      ImageUrl?.HighPic || ImageUrl?.Pic500x500?.LowPic;
   
    if (mainImageUrl) {
      const timestamp = Date.now();
      const imageExt = path.extname(mainImageUrl) || ".jpg";
      imageFilename = `icecat_${productCode}_main_${timestamp}${imageExt}`;

      const downloadedFilename= await downloadImage(mainImageUrl, imageFilename);

  
    }
    const  generalInfo= response.data.data.GeneralInfo;

    const productData = {
      sku: productCode,
      mfr: productCode,
      techPartNo: null,
      shortDescp: generalInfo?.Title || null,
      longDescp: generalInfo?.Description?.LongDesc || null,
      metaTitle: generalInfo?.Title || null,
      metaDescp: generalInfo?.Description?.LongDesc || null,
      ucpCode: "123",
      productSource: "icecat",
      userId: 1,
      mainImage:imageFilename || null,
      title: generalInfo?.ProductName || generalInfo?.Title || productCode,
      price: req.body.price ? parseFloat(req.body.price) : 0.0,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
      brandId: brandRecord.id,
      categoryId: 1,
      subCategoryId: 1,
    };

    // 1️⃣ Create product
    const product = await Product.create(productData);
    
    const gallery = response.data.data.Gallery;

if (gallery && Array.isArray(gallery)) {
  for (const [index, img] of gallery.entries()) {
    const imgUrl = img.Pic500x500 || img.Pic || img.LowPic;

    if (!imgUrl) continue;
      const timestamp = Date.now();
      const imageExt = path.extname(imgUrl) || ".jpg";
      imageFilename = `icecat_${productCode}_main_${timestamp}${imageExt}`;

       downloadedFilename= await downloadImage(imgUrl, imageFilename);
    if (downloadedFilename) {
      await Image.create({
        imageTitle: `Image ${index + 1} `,
        url: imageFilename,
        productId: product.id,
      });
      console.log(`✅ Image ${index + 1} associated with product`);
    }

  }
}
    res.status(201).json({
      message: "Product imported successfully with images",
      Product,
    });
  } catch (error) {
    console.error(
      "❌ Error importing product:",
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
          importedAt: new Date().toISOString(),
        },
        {
          id: 2,
          productCode: "TEST123",
          brand: "HP",
          status: "processing",
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
