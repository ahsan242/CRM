

const express = require("express");
const router = express.Router();
const {
  createTechProduct,
  getTechProducts,
  getTechProduct,
  updateTechProduct,
  deleteTechProduct,
} = require("../controllers/techProductController");

router.post("/", createTechProduct);
router.get("/", getTechProducts);
router.get("/:id", getTechProduct);
router.put("/:id", updateTechProduct);
router.delete("/:id", deleteTechProduct);

module.exports = router;