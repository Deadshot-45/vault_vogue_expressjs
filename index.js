/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import { validationResult } from "express-validator";
import winston from "winston";
import CartRoutes from "./Routes/Cart.routes.js";
import UserRoutes from "./Routes/User.routes.js";
import ProductRoutes from "./Routes/Products.routes.js";
import dbConnection from "./Utils/Connect.js";
import AuthRoutes from "./Routes/Auth.routes.js";

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5500",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5500",
      "https://voguevault.vercel.app",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true, // This is important
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Add headers for image responses
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  }
  next();
});

// Serve static files with proper headers
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res, path) => {
      if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      }
    },
  })
);

app.use(express.json());
app.use(express.static("public"));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Request validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// API routes with validation
app.use("/api/data", validateRequest, UserRoutes);
app.use("/api/data/products", validateRequest, ProductRoutes);
app.use("/api/data/cart", validateRequest, CartRoutes);
app.use("/api/data", validateRequest, AuthRoutes);

// 404 handler
app.use("*", (req, res) => {
  logger.warn(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: true, message: "Page Not Found" });
});

// Error handler
app.use((err, req, res) => {
  logger.error(err.stack);
  res.status(500).json({
    error: true,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

const StartServer = async () => {
  try {
    await dbConnection();
    logger.info("Connected to the database");
    app.listen(5500, () => {
      logger.info("Server is running on port 5500");
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
    process.exit(1);
  }
};

StartServer();
