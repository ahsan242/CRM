
const db = require('../config/db');
const TechProductName = db.TechProductName;

exports.createTechProductName = async (req, res) => {
  try {
    const techProductName = await TechProductName.create(req.body);
    res.status(201).json(techProductName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTechProductNames = async (req, res) => {
  try {
    const names = await TechProductName.findAll();
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTechProductName = async (req, res) => {
  try {
    const name = await TechProductName.findByPk(req.params.id);
    if (!name) return res.status(404).json({ error: 'TechProductName not found' });
    res.json(name);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTechProductName = async (req, res) => {
  try {
    const name = await TechProductName.findByPk(req.params.id);
    if (!name) return res.status(404).json({ error: 'TechProductName not found' });

    await name.update(req.body);
    res.json(name);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTechProductName = async (req, res) => {
  try {
    const name = await TechProductName.findByPk(req.params.id);
    if (!name) return res.status(404).json({ error: 'TechProductName not found' });

    await name.destroy();
    res.json({ message: 'TechProductName deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};