const express = require("express");
const router = express.Router();
const Offer = require("../models/offer");
const protect = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Product = require("../models/products");
const User = require("../models/user");
const Message = require("../models/Message");

// Gönderilen teklifleri listele (durum filtresi ile)
router.get("/sent/:userId", async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  const filter = { offeredBy: userId };
  if (status) filter.status = status;

  try {
    const offers = await Offer.find(filter)
      .populate(
        "offeredProducts requestedProducts conversation offeredBy offeredTo"
      )
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklifler alınırken hata oluştu.", error });
  }
});

// Alınan teklifleri listele (durum filtresi ile)
router.get("/received/:userId", async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  const filter = { offeredTo: userId };
  if (status) filter.status = status;

  try {
    const offers = await Offer.find(filter)
      .populate(
        "offeredProducts requestedProducts conversation offeredBy offeredTo"
      )
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklifler alınırken hata oluştu.", error });
  }
});

// Teklif detayını getir
router.get("/offer-detail/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate([
      "offeredProducts",
      "requestedProducts",
      "offeredBy",
      "offeredTo",
      "conversation",
      "originalOffer",
      "initialMessage",
    ]);

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    res.json(offer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklif getirilirken hata oluştu.", error });
  }
});

// Teklif zincirini getir (orijinal + tüm karşı teklifler + zincir durumu)
router.get("/offer-chain/:id", protect, async (req, res) => {
  try {
    const offerId = req.params.id;

    /* 1. Orijinal teklifi bul ve populate et */
    const originalOffer = await Offer.findById(offerId).populate([
      "offeredProducts",
      "requestedProducts",
      "offeredBy",
      "offeredTo",
      "conversation",
      "initialMessage",
    ]);

    if (!originalOffer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    /* 2. Orijinal teklif + bütün karşı teklifleri sırala */
    const chain = await Offer.find({
      $or: [{ _id: originalOffer._id }, { originalOffer: originalOffer._id }],
    })
      .populate([
        "offeredProducts",
        "requestedProducts",
        "offeredBy",
        "offeredTo",
        "conversation",
        "initialMessage",
      ])
      .sort({ createdAt: 1 });

    /* 3. Zincir kapandı mı? (en az bir teklif Kabul Edildi veya Karşı Teklif Gönderildi ise) */
    const isChainClosed = chain.some((offer) =>
      ["Kabul Edildi", "Karşı Teklif Gönderildi"].includes(offer.status)
    );

    /* 4. Yanıt */
    res.json({ originalOffer, chain, isChainClosed });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklif zinciri alınırken hata oluştu.", error });
  }
});

// Teklif oluştur
router.post("/create-offer", protect, async (req, res) => {
  try {
    const {
      offeredTo,
      offeredProducts,
      requestedProducts,
      offeredCash,
      requestedCash,
      type,
      isCounterOffer,
      originalOffer,
      message,
    } = req.body;

    const offeredBy = req.user._id;

    // Konuşma var mı kontrol et
    let conversation = await Conversation.findOne({
      participants: { $all: [offeredBy, offeredTo] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [offeredBy, offeredTo],
      });
      await conversation.save();
      console.log("✅ Konuşma oluşturuldu:", conversation._id);
    } else {
      console.log("🔁 Mevcut konuşma bulundu:", conversation._id);
    }

    // Yeni teklif oluştur
    const newOffer = new Offer({
      offeredBy,
      offeredTo,
      offeredProducts,
      requestedProducts,
      offeredCash: offeredCash || 0,
      requestedCash: requestedCash || 0,
      type: type || "mixed",
      isCounterOffer: isCounterOffer || false,
      originalOffer: originalOffer || null,
      conversation: conversation._id,
    });

    await newOffer.save();
    console.log("✅ Teklif başarıyla kaydedildi:", newOffer._id);

    if (!conversation.offerId) {
      conversation.offerId = newOffer._id;
      await conversation.save();
    }

    let newMessage = null;
    if (message && message.trim() !== "") {
      // Mesajı da kaydet
      newMessage = new Message({
        conversationId: conversation._id,
        sender: offeredBy,
        text: message.trim(),
        offer: newOffer._id,
      });

      await newMessage.save();
      console.log("✅ Mesaj başarıyla kaydedildi:", newMessage._id);

      newOffer.initialMessage = newMessage._id;
      await newOffer.save();
    }

    res.status(201).json({
      offer: newOffer,
      message: newMessage,
    });
  } catch (error) {
    console.error("❌ Teklif oluşturulurken hata:", error);
    res.status(500).json({
      message: "Teklif oluşturulurken hata oluştu.",
      error: error.message || "Bilinmeyen hata",
    });
  }
});

// Teklifi kabul et
router.put("/:id/accept", protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    if (offer.offeredTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Teklifi kabul etme yetkiniz yok." });
    }

    // Teklifi kabul et
    offer.status = "Kabul Edildi";
    await offer.save();

    // Aynı conversation'daki diğer Beklemede teklifleri pasif yap
    await Offer.updateMany(
      {
        conversation: offer.conversation,
        _id: { $ne: offer._id },
        status: "Beklemede",
      },
      { status: "Geri Çekildi" }
    );

    res.json({ message: "Teklif kabul edildi.", offer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklif kabul edilirken hata oluştu.", error });
  }
});

// Teklifi reddet
router.put("/:id/reject", protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    if (offer.offeredTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Teklifi reddetme yetkiniz yok." });
    }

    offer.status = "Reddedildi";
    await offer.save();

    res.json({ message: "Teklif reddedildi.", offer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklif reddedilirken hata oluştu.", error });
  }
});

// Karşı teklif oluştur (mesaj ile birlikte)
router.post("/:id/counter", protect, async (req, res) => {
  try {
    const originalOffer = await Offer.findById(req.params.id);

    if (!originalOffer) {
      return res.status(404).json({ message: "Orijinal teklif bulunamadı." });
    }

    if (originalOffer.offeredTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Karşı teklif oluşturma yetkiniz yok." });
    }

    // Orijinal teklif halen Beklemede ise yeni statusa geçir
    if (originalOffer.status === "Beklemede") {
      originalOffer.status = "Karşı Teklif Gönderildi"; // yeni durum
      await originalOffer.save();
    }

    const {
      offeredProducts,
      requestedProducts,
      offeredCash,
      requestedCash,
      message,
      type,
    } = req.body;

    const counterOffer = new Offer({
      offeredBy: req.user._id,
      offeredTo: originalOffer.offeredBy,
      offeredProducts:
        offeredProducts.length > 0
          ? offeredProducts
          : originalOffer.requestedProducts, // kendi teklif ettiğin ürünler
      requestedProducts:
        requestedProducts.length > 0
          ? requestedProducts
          : originalOffer.offeredProducts, // karşıdan istenen
      offeredCash: offeredCash || 0,
      requestedCash: requestedCash || 0,
      status: "Beklemede",
      type: type || "mixed",
      isCounterOffer: true,
      originalOffer: originalOffer._id,
      conversation: originalOffer.conversation,
    });

    await counterOffer.save();

    // Conversation'daki offerId güncelle
    const conv = await Conversation.findById(originalOffer.conversation);
    conv.offerId = counterOffer._id;
    await conv.save();

    let newMessage = null;
    if (message && message.trim() !== "") {
      newMessage = new Message({
        conversationId: originalOffer.conversation,
        sender: req.user._id,
        text: message.trim(),
        offer: counterOffer._id,
      });
      await newMessage.save();

      counterOffer.initialMessage = newMessage._id;
      await counterOffer.save();
    }

    res.status(201).json({
      counterOffer,
      message: newMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Karşı teklif oluşturulurken hata oluştu.", error });
  }
});

// Teklifi geri çek
router.put("/:id/withdraw", protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    if (offer.offeredBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Teklifi geri çekme yetkiniz yok." });
    }

    if (offer.status !== "Beklemede") {
      return res
        .status(400)
        .json({ message: "Sadece beklemede olan teklifler geri çekilebilir." });
    }

    offer.status = "Geri Çekildi";
    await offer.save();

    res.json({ message: "Teklif geri çekildi.", offer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Teklif geri çekilirken hata oluştu.", error });
  }
});

// Teklif sil
router.delete("/:id", protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    if (offer.offeredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Teklifi silme yetkiniz yok." });
    }

    await Offer.deleteOne({ _id: req.params.id });

    res.json({ message: "Teklif başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: "Teklif silinirken hata oluştu.", error });
  }
});

// ConversationId ile mesajları çek (korumalı)
router.get(
  "/conversation-messages/:conversationId",
  protect,
  async (req, res) => {
    const { conversationId } = req.params;
    try {
      const messages = await Message.find({ conversation: conversationId })
        .populate("sender", "username profileImage")
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Mesajlar alınırken hata oluştu.", error });
    }
  }
);

module.exports = router;
