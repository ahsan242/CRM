

const db = require('../config/db');
const SubCategory = db.SubCategory;

exports.createSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.create(req.body);
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll();
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory) return res.status(404).json({ error: 'SubCategory not found' });
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory) return res.status(404).json({ error: 'SubCategory not found' });

    await subCategory.update(req.body);
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);
    if (!subCategory) return res.status(404).json({ error: 'SubCategory not found' });

    await subCategory.destroy();
    res.json({ message: 'SubCategory deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};