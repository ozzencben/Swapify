const express = require("express");
const router = express.Router();
const Category = require("../models/category");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Kategoriler alınamadı:", error);
    res.status(500).json({ message: "Kategoriler alınamadı." });
  }
});

module.exports = router;
