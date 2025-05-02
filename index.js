import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import cors from "cors"; // Importing CORS middleware
// import dbConnect from "./Utils/DBConnect.js"; // Importing database connection utility
import CartRoutes from "./Routes/Cart.routes.js"; // Importing cart routes
import UserRoutes from "./Routes/User.routes.js"; // Importing user routes
import ProductRoutes from "./Routes/Products.routes.js"; // Importing product routes
import dbConnection from "./Utils/Connect.js"; // Importing database connection utility
import AuthRoutes from "./Routes/Auth.routes.js"; // Importing user routes

const app = express();
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5500"], // Allowed origins
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
app.use(cors(corsOptions)); // Allow requests from http://localhost:5500/
app.use(express.json());
app.use(express.static("public"));

// Add a root route handler
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.use("/api/data", UserRoutes);
app.use("/api/data/products", ProductRoutes);
app.use("/api/data/cart", CartRoutes);
app.use("/api/data", AuthRoutes);

// 404 Page Not Found
app.use("*", (req, res) => {
  res.status(404).json({ error: true, message: "Page Not Found" });
});

// Server-Side Error Handling
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: true, message: err.message });
});

const StartServer = async () => {
  try {
    await dbConnection(); // Establishing the database connection
    console.log("Connected to the database");
    app.listen(5500, () => {
      console.log("Server is running on port 5500"); // Starting the server+
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

StartServer(); // Starting the server
