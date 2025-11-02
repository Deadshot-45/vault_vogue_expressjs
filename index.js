/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// validationResult from express-validator removed due to vulnerable transitive dependency (validator)
import winston from "winston";
import CartRoutes from "./Routes/Cart.routes.js";
import UserRoutes from "./Routes/User.routes.js";
import ProductRoutes from "./Routes/Products.routes.js";
import dbConnection from "./Utils/Connect.js";
import AuthRoutes from "./Routes/Auth.routes.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure logger for serverless environment
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const app = express();

// Set Express to trust proxy headers (like X-Forwarded-For) since the app is deployed on Vercel.
// This is necessary for express-rate-limit to function correctly.
app.set("trust proxy", 1);

// Security middleware - CSP disabled for API server to allow cross-origin requests
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API server
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
    crossOriginEmbedderPolicy: false, // Allow cross-origin embedding
  })
);

// CORS configuration - MUST be before rate limiting to handle preflight requests
const allowedOrigins = [
  "https://vogue-vault-blue.vercel.app",
  "http://localhost:5173",
  "https://vault-vogue-expressjs.vercel.app",
];

const corsOptionsDelegate = function (req, callback) {
  const origin = req.headers.origin;
  let corsOptions;
  // Check if origin is in whitelist (case-insensitive, handle undefined)
  if (
    origin &&
    allowedOrigins.some(
      (allowed) => allowed.toLowerCase() === origin.toLowerCase()
    )
  ) {
    corsOptions = {
      origin: true, // Reflect the requested origin in the CORS response
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Cookie", // Allow cookies
      ],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
    // Log CORS success in development
    if (process.env.NODE_ENV !== "production") {
      logger.debug(`CORS allowed for origin: ${origin}`);
    }
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
    if (process.env.NODE_ENV !== "production") {
      logger.warn(`CORS blocked for origin: ${origin || "undefined"}`);
    }
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// Apply CORS middleware FIRST (before rate limiting)
app.use(cors(corsOptionsDelegate));

// Rate limiting - skip for OPTIONS (preflight) requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => req.method === "OPTIONS", // Skip rate limiting for preflight requests
});
app.use(limiter);
app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(
    `${req.method} ${req.url} - Origin: ${req.headers.origin || "none"}`
  );
  next();
});

// Request validation middleware (no-op)
// express-validator was removed because it pulls in a vulnerable `validator` version.
// If you need request validation, replace with a safer library (e.g. joi) or add custom checks.
const validateRequest = (req, res, next) => next();

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await dbConnection();
    next();
  } catch (error) {
    logger.error("Database connection error:", error);
    res.status(500).json({
      error: true,
      message: error,
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// API routes with validation
app.use("/api/data", validateRequest, UserRoutes);
app.use("/api/data/products", validateRequest, ProductRoutes);
app.use("/api/data/cart", validateRequest, CartRoutes);
app.use("/api/data", validateRequest, AuthRoutes);

// 404 handler (catch-all)
app.use((req, res) => {
  logger.warn(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: true, message: "Page Not Found" });
});

// Error handler (include `next` so Express recognizes it as an error-handling middleware)
app.use((err, req, res, next) => {
  logger.error(err && err.stack ? err.stack : err);
  res.status(500).json({
    error: true,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err && err.message
        ? err.message
        : String(err),
  });
});

// Export a serverless-compatible handler as the default export.
// Some serverless platforms expect a function handler instead of an Express app instance.
export default function handler(req, res) {
  return app(req, res);
}

app.listen(process.env.PORT || 3000, () => {
  logger.info(
    `Server running in ${process.env.NODE_ENV} mode on port ${
      process.env.PORT || 3000
    }`
  );
});
