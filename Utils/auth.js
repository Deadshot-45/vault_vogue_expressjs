import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  // Check if no token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Extract token from Bearer string
    const token = authHeader.split(" ")[1];

    // Verify token
    // eslint-disable-next-line no-undef
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = { user: email };
    next();
  } catch (err) {
    res.status(401).json({ error: true, message: err.message });
  }
};

export default auth;
