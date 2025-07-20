const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "swapify/profile_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const parser = multer({ storage: storage });

router.post("/register", async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Bu kullanıcı adı veya email zaten kayıtlı." });
    }

    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    const { password: _, ...userData } = user.toObject();

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      user: userData,
    });
  } catch (error) {
    console.error("Kullanıcı kaydı başarısız:", error);
    res
      .status(500)
      .json({ message: "Sunucu hatası: kullanıcı oluşturulamadı." });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!existingUser) {
      return res
        .status(401)
        .json({ message: "Kullanıcı adı veya email hatalı" });
    }

    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!verifyPassword) {
      return res.status(401).json({ message: "Şifreler eşleşmiyor" });
    }

    const accessToken = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = existingUser.toObject();
    existingUser.refreshTokens.push(refreshToken);
    await existingUser.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Giriş Hatası", error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
});

router.post("/token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Token gerekli" });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Geçersiz refresh token" });
    }

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token geçersiz veya süresi dolmuş" });
  }
});

router.post("/logout", protect, async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();

    res.json({ message: "Çıkış yapıldı" });
  } catch (error) {
    res.status(500).json({ message: "Çıkış yapılamadı" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({
      message: "Kullanıcı bilgileri başarıyla alındı",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Kullanıcı bilgileri alınamadı" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.put("/update-user-profile", protect, async (req, res) => {
  const { username, firstName, lastName, email, location, bio } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı." });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res
          .status(401)
          .json({ message: "Bu kullanıcı adı zaten alınmış" });
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(401).json({ message: "Bu email zaten kayıtlı" });
      }
    }

    const fields = [
      "username",
      "firstName",
      "lastName",
      "email",
      "location",
      "bio",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.status(200).json({
      message: "Kullanıcı başarıyla güncellendi.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    res.status(500).json({ message: "Güncelleme Hatası" });
  }
});

router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(401).json({ message: "Lütfen tüm alanları doldurun." });
    }

    if (currentPassword === newPassword) {
      return res
        .status(401)
        .json({ message: "Eski şifrenizi tekrardan kullanamazsınız" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 6 karakter olmalı." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı." });
    }

    const verifyPassword = await bcrypt.compare(currentPassword, user.password);

    if (!verifyPassword) {
      return res.status(401).json({ message: "Eski şifreniz hatalı" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Şifre başarıyla değiştirildi.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Şifre değiştirme hatası:", error.message);
    res.status(500).json({ message: "Şifre değiştirilirken hata oluştu." });
  }
});

router.put(
  "/upload-profile-image",
  protect,
  parser.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Dosya bulunamadı" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      // Cloudinary URL'yi kaydet
      user.profileImage = req.file.path; // bu zaten Cloudinary URL oluyor
      await user.save();

      res.status(200).json({
        message: "Profil resmi başarıyla güncellendi",
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error("Profil resmi güncelleme hatası:", error);
      res
        .status(500)
        .json({ message: "Profil resmi güncellenirken hata oluştu" });
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Kayıtlı kullanıcı bulunamadı." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 dk

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      Merhaba,

      Aşağıdaki linke tıklayarak şifrenizi sıfırlayabilirsiniz. Link 15 dakika geçerlidir.

      ${resetUrl}

      Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.

      Teşekkürler,
      Swapify Ekibi
    `;

    await sendEmail(user.email, "Swapify Şifre Sıfırlama", message);

    res.status(200).json({
      message:
        "Şifre sıfırlama maili gönderildi. Lütfen e-postanızı kontrol edin.",
    });
  } catch (error) {
    console.error("Forgot-password hatası:", error);
    res.status(500).json({ message: "Şifre sıfırlama işlemi başarısız." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const resetToken = req.params.token;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Yeni şifre en az 6 karakter olmalı." });
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token geçersiz veya süresi dolmuş." });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: "Şifre başarıyla sıfırlandı." });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res.status(500).json({ message: "Şifre sıfırlanırken hata oluştu." });
  }
});

module.exports = router;
