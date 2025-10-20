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

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.static("public"));

// Add headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
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
      message: "Database connection error",
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
