const mongoose = require("mongoose");

function imageArrayLimit(val) {
  return val.length > 0;
}

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Satılık", "Takas", "Her İkisi"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["Yeni", "İkinci El"],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Aktif", "Satıldı", "Takas Yapıldı"],
      default: "Aktif",
    },
    tags: {
      type: [String],
      default: [],
    },
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model("Product", productSchema);
