const express = require("express");
const router = express.Router();
const {
  createTechProductName,
  getTechProductNames,
  getTechProductName,
  updateTechProductName,
  deleteTechProductName,
} = require("../controllers/techProductNameController");

router.post("/", createTechProductName);
router.get("/", getTechProductNames);
router.get("/:id", getTechProductName);
router.put("/:id", updateTechProductName);
router.delete("/:id", deleteTechProductName);

module.exports = router;