const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dns = require("dns");

dotenv.config();
const app = express();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const parseAllowedOrigins = () => {
  const defaults = ["http://localhost:5173", "http://127.0.0.1:5173"];
  const fromEnv = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...fromEnv])];
};

const allowedOrigins = parseAllowedOrigins();
const vercelPattern = /^https:\/\/.*\.vercel\.app$/i;
const renderPattern = /^https:\/\/.*\.onrender\.com$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || vercelPattern.test(origin) || renderPattern.test(origin)) {
        callback(null, true);
      } else {
        console.warn(`⛔ CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "cache-control", "X-Requested-With"],
    maxAge: 86400,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const auth = req.headers.authorization ? "✅" : "❌";
  console.log(`📨 ${req.method} ${req.url} | Auth: ${auth}`);
  next();
});

const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
app.use("/uploads", express.static(uploadsRoot));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

/* ===================== ROUTES ===================== */
app.use("/api", require("./src/routes/authRoutes"));
app.use("/api", require("./src/routes/userRoutes"));
app.use("/api", require("./src/routes/productRoutes"));
app.use("/api", require("./src/routes/adminRoutes"));
app.use("/api", require("./src/routes/cartRoutes"));
app.use("/api", require("./src/routes/orderRoutes"));
app.use("/api", require("./src/routes/ContactRoutes"));
app.use("/api", require("./src/routes/CustomizatonRoutes"));
app.use("/api", require("./src/routes/newsletterRoutes"));

/* ===================== HEALTH ===================== */
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server running", mongoState: mongoose.connection.readyState });
});

app.get("/", (req, res) => {
  res.json({ message: "Bakery API running 🚀" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found", path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));