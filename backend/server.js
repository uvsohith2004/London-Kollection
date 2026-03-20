import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { connectDatabase } from "./config/database.js";

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return parsed.origin.toLowerCase();
  } catch (error) {
    return String(value).trim().replace(/\/$/, "").toLowerCase();
  }
};

const configuredFrontendOrigins = (process.env.FRONTEND_URL || "http://localhost:8080")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const devAllowedOrigins = new Set(
  [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...configuredFrontendOrigins,
  ].map((origin) => normalizeOrigin(origin))
);

console.log("[SERVER] Configuration:", {
  PORT,
  frontendOrigins: configuredFrontendOrigins,
  isProduction,
  razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        "connect-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        "img-src": ["'self'", "data:", "https:", "blob:"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      },
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (isProduction) {
        if (configuredFrontendOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        const corsError = new Error(`CORS blocked for origin: ${origin}`);
        corsError.statusCode = 403;
        corsError.code = "CORS_BLOCKED";
        return callback(corsError, false);
      }

      const isLocalhost =
        /^http:\/\/localhost:\d+$/i.test(normalizedOrigin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/i.test(normalizedOrigin);

      if (devAllowedOrigins.has(normalizedOrigin) || isLocalhost) {
        return callback(null, true);
      }

      const corsError = new Error(`CORS blocked for origin: ${origin}`);
      corsError.statusCode = 403;
      corsError.code = "CORS_BLOCKED";
      return callback(corsError, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    console.log("[DB] Connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend origins: ${configuredFrontendOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

export default app;
