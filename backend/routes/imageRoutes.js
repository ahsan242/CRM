
const express = require("express");
const router = express.Router();
const {
  createImage,
  getImages,
  getImage,
  updateImage,
  deleteImage,
} = require("../controllers/imageController");

router.post("/", createImage);
router.get("/", getImages);
router.get("/:id", getImage);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

module.exports = router;