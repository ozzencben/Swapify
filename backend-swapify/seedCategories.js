const mongoose = require("mongoose");
const Category = require("./models/category");
require("dotenv").config();

const categoriesToAdd = [
  { name: "Elektronik" },
  { name: "Bilgisayar & Tablet" },
  { name: "Telefon & Aksesuar" },
  { name: "Ev & Yaşam" },
  { name: "Mobilya" },
  { name: "Moda & Giyim" },
  { name: "Ayakkabı & Çanta" },
  { name: "Spor & Outdoor" },
  { name: "Kozmetik & Kişisel Bakım" },
  { name: "Kitap, Müzik & Film" },
  { name: "Oyuncak & Hobi" },
  { name: "Anne & Bebek" },
  { name: "Otomobil & Motosiklet" },
  { name: "Bahçe Aletleri" },
  { name: "Mutfak Eşyaları" },
  { name: "Ofis & Kırtasiye" },
  { name: "Elektrikli Ev Aletleri" },
  { name: "Saat & Takı" },
  { name: "Sağlık & Medikal" },
  { name: "Evcil Hayvan Ürünleri" },
  { name: "Seyahat & Bagaj" },
];

async function addCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB'ye bağlanıldı");

    for (const categoryData of categoriesToAdd) {
      const exists = await Category.findOne({ name: categoryData.name });
      if (!exists) {
        const cat = new Category(categoryData);
        await cat.save();
        console.log(`Kategori eklendi: ${categoryData.name}`);
      } else {
        console.log(`Kategori zaten var: ${categoryData.name}`);
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Kategori eklerken hata:", error);
  }
}

addCategories();
