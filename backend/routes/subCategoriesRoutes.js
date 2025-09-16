

const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

router.post("/", createSubCategory);
router.get("/", getSubCategories);
router.get("/:id", getSubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

module.exports = router;