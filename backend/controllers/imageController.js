// const db = require('../config/db');
// const Image = db.Image;
// const Product = db.Product;

// exports.createImage = async (req, res) => {
//   try {
//     const image = await Image.create(req.body);
//     res.status(201).json(image);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getImages = async (req, res) => {
//   try {
//     const images = await Image.findAll({ include: [Product] });
//     res.json(images);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getImage = async (req, res) => {
//   try {
//     const image = await Image.findByPk(req.params.id, { include: [Product] });
//     if (!image) return res.status(404).json({ error: 'Image not found' });
//     res.json(image);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.updateImage = async (req, res) => {
//   try {
//     const image = await Image.findByPk(req.params.id);
//     if (!image) return res.status(404).json({ error: 'Image not found' });

//     await image.update(req.body);
//     res.json(image);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.deleteImage = async (req, res) => {
//   try {
//     const image = await Image.findByPk(req.params.id);
//     if (!image) return res.status(404).json({ error: 'Image not found' });

//     await image.destroy();
//     res.json({ message: 'Image deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const db = require('../config/db');
const Image = db.Image;
const Product = db.Product;
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const uploadSingle = upload.single('image');

exports.createImage = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const { imageTitle, productId } = req.body;
        
        if (!req.file) {
          return res.status(400).json({ error: 'Image file is required' });
        }

        const image = await Image.create({
          imageTitle: imageTitle || req.file.originalname,
          url: req.file.filename,
          productId: productId || null
        });

        const imageWithProduct = await Image.findByPk(image.id, {
          include: [Product]
        });

        res.status(201).json(imageWithProduct);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getImages = async (req, res) => {
  try {
    const images = await Image.findAll({ include: [Product] });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getImage = async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.id, { include: [Product] });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateImage = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const image = await Image.findByPk(req.params.id);
        if (!image) return res.status(404).json({ error: 'Image not found' });

        const updateData = { ...req.body };

        if (req.file) {
          updateData.url = req.file.filename;
        }

        await image.update(updateData);

        const updatedImage = await Image.findByPk(req.params.id, {
          include: [Product]
        });

        res.json(updatedImage);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findByPk(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    await image.destroy();
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};