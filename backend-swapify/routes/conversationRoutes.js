const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/user");
const protect = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Yeni konuşma başlat veya var olanı getir
router.post("/start-conversation", protect, async (req, res) => {
  const { receiverId } = req.body;
  const currentUserId = req.user._id.toString();

  if (receiverId === currentUserId) {
    return res.status(400).json({ message: "Kendinle konuşma başlatılamaz." });
  }

  try {
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const receiverExists = await User.exists({ _id: receiverObjectId });
    if (!receiverExists) {
      return res.status(400).json({ message: "Alıcı kullanıcı bulunamadı." });
    }

    const existingConversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverObjectId] },
    });

    if (existingConversation) return res.status(200).json(existingConversation);

    const newConversation = new Conversation({
      members: [req.user._id, receiverObjectId],
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Konuşma başlatılamadı." });
  }
});

// Kullanıcının konuşmalarını getir
router.get("/get-conversations", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      members: userId,
      deletedBy: { $ne: userId }, // silenlerin konuşmaları gelmesin
    })
      .sort({ updatedAt: -1 })
      .lean();

    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        if (!conversation.members || !Array.isArray(conversation.members)) {
          return null;
        }

        const otherUserId = conversation.members.find(
          (id) => id.toString() !== userId
        );

        if (!otherUserId) return null;

        const otherUser = await User.findById(otherUserId).select(
          "_id firstName lastName profileImage"
        );

        const latestMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...conversation,
          otherUser,
          latestMessage,
        };
      })
    );

    const filteredConversations = enhancedConversations.filter(
      (c) => c !== null
    );

    res.status(200).json(filteredConversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Konuşmalar alınamadı." });
  }
});

// Konuşmayı sil (kendi listesinden)
router.delete("/:id", protect, async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.user._id.toString();

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Konuşma bulunamadı." });
    }

    if (!conversation.members.map((m) => m.toString()).includes(userId)) {
      return res
        .status(403)
        .json({ message: "Bu konuşmayı silme yetkiniz yok." });
    }

    if (!conversation.deletedBy.map((id) => id.toString()).includes(userId)) {
      conversation.deletedBy.push(userId);
      await conversation.save();
    }

    // Tüm üyeler deletedBy'daysa gerçek silme yap
    const allDeleted = conversation.members.every((member) =>
      conversation.deletedBy
        .map((id) => id.toString())
        .includes(member.toString())
    );

    if (allDeleted) {
      await Conversation.findByIdAndDelete(conversationId);
      await Message.deleteMany({ conversationId });
    }

    res
      .status(200)
      .json({ message: "Konuşma sadece sizin listenizden silindi." });
  } catch (err) {
    console.error("Konuşma silme hatası:", err);
    res.status(500).json({ message: "Konuşma silinemedi." });
  }
});

// **Yeni**: Mesaj gönderme endpoint'i
router.post("/send-message", protect, async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.user._id;

  try {
    // Mesaj oluştur ve kaydet
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text,
    });

    const savedMessage = await newMessage.save();

    // Conversation'ı bul
    const conversation = await Conversation.findById(conversationId);

    if (conversation) {
      const userIdStr = senderId.toString();

      // Eğer kullanıcı deletedBy listesinde ise çıkar
      if (
        conversation.deletedBy.map((id) => id.toString()).includes(userIdStr)
      ) {
        conversation.deletedBy = conversation.deletedBy.filter(
          (id) => id.toString() !== userIdStr
        );
        await conversation.save();
      }

      // Ayrıca conversation'ın son mesajını güncelle
      conversation.lastMessage = text;
      await conversation.save();
    }

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("Mesaj gönderme hatası:", err);
    res.status(500).json({ message: "Mesaj gönderilemedi." });
  }
});

module.exports = router;
