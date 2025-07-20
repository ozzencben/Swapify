const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoriesRoutes = require("./routes/categories");
const ConversationRoutes = require("./routes/conversationRoutes");
const MessageRoutes = require("./routes/messageRoutes");
const http = require("http");
const { Server } = require("socket.io");
const OfferRoutes = require("./routes/offerRoutes");
const Conversation = require("./models/Conversation");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("🔌 Yeni kullanıcı bağlandı: " + socket.id);

  // Kullanıcıyı ekle
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", onlineUsers); // İsteyen herkese gönder
  });

  // Mesaj gönder
  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, text, conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return;

        const receiverIdStr = receiverId.toString();

        // Eğer alıcı deletedBy'da ise çıkar
        if (
          conversation.deletedBy
            .map((id) => id.toString())
            .includes(receiverIdStr)
        ) {
          conversation.deletedBy = conversation.deletedBy.filter(
            (id) => id.toString() !== receiverIdStr
          );
          await conversation.save();
        }

        const user = getUser(receiverId);
        if (user) {
          io.to(user.socketId).emit("getMessage", {
            sender: senderId,
            text,
            conversationId,
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Socket mesaj gönderme hatası:", error);
      }
    }
  );

  // Bağlantı kesildi
  socket.on("disconnect", () => {
    console.log("❌ Kullanıcı ayrıldı: " + socket.id);
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

connectDB();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/conversations", ConversationRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/offers", OfferRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🔌 Sunucu ${PORT} portunda ve socket.io aktif!`);
});
