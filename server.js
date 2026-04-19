const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
