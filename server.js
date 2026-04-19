const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const {
  ADMIN_CRITICAL_ALERT_ROOM,
  getUserRoom,
  setSocketServer,
} = require("./services/socketService");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    const isSameWifi = /^https?:\/\/192\.168\.2\.\d{1,3}(:\d+)?$/i.test(origin);

    if (isLocalhost || isSameWifi) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/alerts",    require("./routes/alertRoutes"));
app.use("/api/reviews",   require("./routes/reviewRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/waiters",   require("./routes/waiterRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Gogo Backend is running." });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    credentials: corsOptions.credentials,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
  },
});

io.use((socket, next) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;
  const token = authToken || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

  if (!token) {
    return next(new Error("Authentication token is required."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (error) {
    return next(new Error("Invalid socket token."));
  }
});

io.on("connection", (socket) => {
  if (socket.user?.id) {
    socket.join(getUserRoom(socket.user.id));
  }

  if (socket.user?.role === 20) {
    socket.join(ADMIN_CRITICAL_ALERT_ROOM);
  }

  socket.emit("socket-ready", {
    success: true,
    role: socket.user?.role,
  });
});

setSocketServer(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Socket.IO server is active.");
});
