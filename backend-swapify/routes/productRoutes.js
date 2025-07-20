const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const Category = require("../models/category");
const mongoose = require("mongoose");

router.post("/create-product", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      condition,
      price,
      category,
      tags,
      images,
    } = req.body;

    // Gerekli alanlar kontrolü
    if (!title || !description || !type || !condition || !category) {
      return res.status(400).json({ message: "Gerekli alanlar eksik." });
    }

    // Görseller zorunlu ve array olmalı
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "En az bir görsel gereklidir." });
    }

    // Tags normalize et
    let tagsArray = [];
    if (typeof tags === "string") {
      tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    }

    // Price kontrol ve ayarlama
    let parsedPrice = Number(price);
    if (type === "Satılık" || type === "Her İkisi") {
      if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
        return res
          .status(400)
          .json({ message: "Fiyat zorunludur ve 0'dan büyük olmalıdır." });
      }
    } else if (type === "Takas") {
      parsedPrice = 0;
    }

    // Cloudinary'ye görselleri paralel yükle
    const uploadedImages = await Promise.all(
      images.map((img) =>
        cloudinary.uploader.upload(img, { folder: "swapify/products" })
      )
    );

    // public_id ve url şeklinde array oluştur
    const formattedImages = uploadedImages.map((uploadRes) => ({
      public_id: uploadRes.public_id,
      url: uploadRes.secure_url,
    }));

    // Ürün oluştur
    const newProduct = await Product.create({
      title,
      description,
      type,
      condition,
      price: parsedPrice,
      images: formattedImages,
      category,
      tags: tagsArray,
      owner: req.user.id,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Ürün oluşturma hatası:", error);
    return res.status(500).json({ message: "Ürün oluşturulamadı." });
  }
});

router.get("/my-product", authMiddleware, async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const query = { owner: req.user.id };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Kullanıcının ürünleri alınamadı:", error);
    res.status(500).json({ message: "Ürünler alınırken bir hata oluştu." });
  }
});

router.get("/all-products", async (req, res) => {
  try {
    const {
      category,
      type,
      condition,
      minPrice,
      maxPrice,
      search,
      tags,
      page = 1,
      limit = 10,
      userId, // userId eklendi
    } = req.query;

    const filter = { status: "Aktif" };

    // Kullanıcıya göre filtreleme (varsa)
    if (userId) {
      filter.owner = userId;
    }

    // Arama (title veya description içinde)
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagsArray = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());

      filter.tags = { $in: tagsArray };
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("owner", "username email profileImage")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      products,
    });
  } catch (error) {
    console.error("Tüm ürünler alınırken hata:", error);
    res.status(500).json({ message: "Ürünler alınamadı." });
  }
});

router.get("/enums", async (req, res) => {
  try {
    const types = ["Satılık", "Takas", "Her İkisi"];
    const conditions = ["Yeni", "İkinci El"];
    const categories = await Category.find().sort({ name: 1 });

    return res.status(200).json({ types, conditions, categories });
  } catch (error) {
    console.error("Enum verileri alınamadı:", error);
    return res.status(500).json({ message: "Enum verileri alınamadı." });
  }
});

router.get("/:id", authMiddleware.optional, async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Geçersiz ürün ID'si." });
    }

    const product = await Product.findById(productId)
      .populate("owner", "username email profileImage")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    let isOwner = false;
    if (req.user && product.owner._id.toString() === req.user.id) {
      isOwner = true;
    }

    const productObj = product.toObject();
    productObj.isOwner = isOwner;

    res.status(200).json(productObj);
  } catch (error) {
    console.error("Ürün detay alınırken hata:", error);
    res.status(500).json({ message: "Ürün detayları alınamadı." });
  }
});

router.put("/update-products/:id", authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı." });

    if (product.owner.toString() !== userId)
      return res
        .status(403)
        .json({ message: "Bu ürünü güncelleme yetkiniz yok." });

    // Tip ve fiyat ilişkisi kontrolü
    if (
      (updateData.type === "Satılık" || updateData.type === "Her İkisi") &&
      (!updateData.price || Number(updateData.price) <= 0)
    ) {
      return res.status(400).json({
        message: "Satılık ürünlerde fiyat zorunludur ve 0'dan büyük olmalıdır.",
      });
    }
    if (updateData.type === "Takas") {
      updateData.price = 0;
    }

    // Görselleri işleme
    if (updateData.images && Array.isArray(updateData.images)) {
      const processedImages = [];

      for (const img of updateData.images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          // base64 ise Cloudinary'ye yükle
          const uploadResult = await cloudinary.uploader.upload(img, {
            folder: "swapify/products",
          });
          processedImages.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        } else if (typeof img === "object" && img.public_id && img.url) {
          // Zaten Cloudinary formatında objeyse
          processedImages.push(img);
        } else {
          return res.status(400).json({ message: "Geçersiz görsel formatı." });
        }
      }

      updateData.images = processedImages;
    }

    // Diğer alanları güncelle
    Object.assign(product, updateData);

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("Ürün güncellenirken hata:", error);
    res.status(500).json({ message: "Ürün güncellenemedi." });
  }
});

router.delete("/delete-products/:id", authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı." });

    if (product.owner.toString() !== userId)
      return res.status(403).json({ message: "Bu ürünü silme yetkiniz yok." });

    await product.deleteOne();

    res.status(200).json({ message: "Ürün başarıyla silindi." });
  } catch (error) {
    console.error("Ürün silinirken hata:", error);
    res.status(500).json({ message: "Ürün silinemedi." });
  }
});

// Favorilere ekle / çıkar (toggle)
router.post("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı." });

    const index = product.favorites.findIndex(
      (favId) => favId.toString() === userId
    );

    if (index === -1) {
      // Favorilere ekle
      product.favorites.push(userId);
      await product.save();
      return res.status(200).json({ message: "Favorilere eklendi.", product });
    } else {
      // Favorilerden çıkar
      product.favorites.splice(index, 1);
      await product.save();
      return res.status(200).json({ message: "Favorilerden çıkarıldı." });
    }
  } catch (error) {
    console.error("Favori işlemi hata:", error);
    res.status(500).json({ message: "Favori işlemi yapılamadı." });
  }
});

// Kullanıcının favori ürünlerini listele
router.get("/users/:id/favorites", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Sadece kendi favorilerini görebilir
    if (req.user.id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    const products = await Product.find({ favorites: userId, status: "Aktif" })
      .populate("category", "name")
      .populate("owner", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Favoriler alınırken hata:", error);
    res.status(500).json({ message: "Favoriler alınamadı." });
  }
});

module.exports = router;
