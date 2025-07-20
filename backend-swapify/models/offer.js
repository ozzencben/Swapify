const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    requestedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    offeredCash: {
      type: Number,
      default: 0,
    },
    requestedCash: {
      type: Number,
      default: 0,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Beklemede",
        "Kabul Edildi",
        "Reddedildi",
        "Geri Çekildi",
        "Karşı Teklif Gönderildi",
      ],
      default: "Beklemede",
    },
    type: {
      type: String,
      enum: ["product", "cash", "mixed"],
      default: "mixed",
    },
    isCounterOffer: {
      type: Boolean,
      default: false,
    },
    originalOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer", // Aynı modelin kendisine referans
      default: null,
    },
    initialMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", offerSchema);
