const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const protect = require("../middleware/authMiddleware");

// Yeni mesaj gönder
router.post("/", protect, async (req, res) => {
  const { conversationId, text } = req.body;

  console.log("Mesaj gönder request geldi:", {
    conversationId,
    text,
    userId: req.user._id,
  });

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("Konuşma bulunamadı:", conversationId);
      return res.status(404).json({ message: "Konuşma bulunamadı" });
    }

    const newMessage = new Message({
      conversationId,
      sender: req.user._id,
      text,
    });

    const savedMessage = await newMessage.save();
    console.log("Mesaj kaydedildi:", savedMessage);

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("Mesaj gönderme sırasında hata:", err);
    res.status(500).json({ message: "Mesaj gönderilemedi." });
  }
});

// Bir konuşmanın tüm mesajlarını al
router.get(
  "/conversations/:conversationId/messages",
  protect,
  async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      }).sort("createdAt");
      res.status(200).json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Mesajlar alınamadı." });
    }
  }
);

module.exports = router;
