
const db = require("../config/db");
const TechProduct = db.TechProduct;
const TechProductName = db.TechProductName;

exports.createTechProduct = async (req, res) => {
  try {
    const techProduct = await TechProduct.create(req.body);
    res.status(201).json(techProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTechProducts = async (req, res) => {
  try {
    const techProducts = await TechProduct.findAll({
      include: [TechProductName],
    });
    res.json(techProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTechProduct = async (req, res) => {
  try {
    const techProduct = await TechProduct.findByPk(req.params.id, {
      include: [TechProductName],
    });
    if (!techProduct)
      return res.status(404).json({ error: "TechProduct not found" });
    res.json(techProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTechProduct = async (req, res) => {
  try {
    const techProduct = await TechProduct.findByPk(req.params.id);
    if (!techProduct)
      return res.status(404).json({ error: "TechProduct not found" });

    await techProduct.update(req.body);
    res.json(techProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTechProduct = async (req, res) => {
  try {
    const techProduct = await TechProduct.findByPk(req.params.id);
    if (!techProduct)
      return res.status(404).json({ error: "TechProduct not found" });

    await techProduct.destroy();
    res.json({ message: "TechProduct deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
