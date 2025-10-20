// Vercel entry wrapper: dynamically import the application at request time
import dotenv from "dotenv";

// Load env early so imports depending on process.env see values
dotenv.config();

export default async function handler(req, res) {
  try {
    const mod = await import("./index.js");

    // Prefer a function default export (serverless handler)
    if (mod && typeof mod.default === "function") {
      return mod.default(req, res);
    }

    // Fallback to Express app instance exported as `app`
    if (mod && mod.app && typeof mod.app === "function") {
      return mod.app(req, res);
    }

    console.error("No valid handler exported from index.js");
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: true, message: "No handler available" }));
  } catch (err) {
    console.error("Error loading or executing application handler:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: true, message: "Server error during import" })
    );
  }
}
