
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import User from "./models/user.js";

dotenv.config();

const app = express();

const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

for (const origin of allowedOrigins) {
  try {
    const configuredUrl = new URL(origin);
    const localHost =
      configuredUrl.hostname === "localhost"
        ? "127.0.0.1"
        : configuredUrl.hostname === "127.0.0.1"
          ? "localhost"
          : null;

    if (localHost) {
      configuredUrl.hostname = localHost;
      allowedOrigins.add(configuredUrl.origin);
    }
  } catch (error) {
    throw new Error(`Invalid FRONTEND_URL origin: ${origin}`, { cause: error });
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ARVÉ Furniture API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) return;
  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 12
  ) {
    throw new Error(
      "Set both ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters."
    );
  }

  let admin = await User.findOne({ email });
  if (admin) {
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    fullName: process.env.ADMIN_NAME?.trim() || "ARVÉ Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });
  console.log(`Administrator account ready for ${email}`);
}

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    await ensureBootstrapAdmin();

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
