const express = require("express");
const router = express.Router();
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController");

router.post("/", createBrand);
router.get("/", getBrands);
router.get("/:id", getBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;