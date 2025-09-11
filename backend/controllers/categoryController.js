// const db = require('../config/db');
// const Category = db.Category;

// exports.createCategory = async (req, res) => {
//   try {
//     const category = await Category.create(req.body);
//     res.status(201).json(category);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getCategories = async (req, res) => {
//   try {
//     const categories = await Category.findAll();
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getCategory = async (req, res) => {
//   try {
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return res.status(404).json({ error: 'Category not found' });
//     res.json(category);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.updateCategory = async (req, res) => {
//   try {
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return res.status(404).json({ error: 'Category not found' });

//     await category.update(req.body);
//     res.json(category);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.deleteCategory = async (req, res) => {
//   try {
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return res.status(404).json({ error: 'Category not found' });

//     await category.destroy();
//     res.json({ message: 'Category deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const db = require('../config/db');
const Category = db.Category;

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};