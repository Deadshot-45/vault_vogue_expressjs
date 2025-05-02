/* eslint-disable no-undef */
import Users from "../models/User.model.js";
import compareEncryptedData from "../Utils/compareEncryption.js";
import generateOtp from "../Utils/genrateOtp.js";
import encryptedData from "../Utils/EncData.js";
import MailSender from "../Utils/MailSender.js";
import jwt from "jsonwebtoken";

const signupUser = async (req, res, next) => {
  try {
    // Validate request body is present
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid request body - no data provided",
      });
    }

    const { name, email, mobile, password, confirm_password } = req.body;

    // Input validation
    if (!name || !email || !mobile || !password || !confirm_password) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    // Password validation
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        error: true,
        message: "Password must be between 8 and 128 characters",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        error: true,
        message: "Password and Confirm Password do not match",
      });
    }

    const existingUser = await Users.findOne({ email, mobile });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: "User with this email or mobile number already exists",
        errorCode: "DUPLICATE_USER",
      });
    }

    try {
      const hashedPassword = await encryptedData(password);
      const user = new Users({ name, email, mobile, password: hashedPassword });
      await user.save();

      // Only return necessary user data to avoid circular references
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      };

      res.status(201).json({
        error: false,
        message: "User added successfully",
        data: userData,
      });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        return res.status(400).json({
          error: true,
          message: "User with this email or mobile number already exists",
        });
      } else {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

const authenticateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    // Input validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: true, message: "Missing required fields" });
    }
    const isUser = await Users.findOne({
      $or: [{ email: username }, { mobile: username }],
    });

    if (!isUser) {
      return res.status(404).json({ message: "Invalid username" });
    }

    const isValidPassword = await compareEncryptedData(
      password,
      isUser.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const otp = generateOtp();
    await MailSender(otp);
    const encOTP = await encryptedData(otp);
    await Users.updateOne(
      { _id: isUser._id },
      { $set: { otp: encOTP, otp_expire: Date.now() + 600000 } }
    );
    res.json({
      error: false,
      message: "OTP sent successfully",
      data: isUser.email,
    });
  } catch (error) {
    next(error);
  }
};

const verifyotp = async (req, res, next) => {
  try {
    let { otp, username } = req.body;
    let isUser = await Users.findOne({
      $or: [{ email: username }, { mobile: username }],
    });
    if (!isUser) {
      return res.status(404).json({ message: "Invalid username" });
    }
    let isOtpExpired = isUser.otp_expire < Date.now();
    if (isOtpExpired) {
      return res.status(401).json({ error: true, message: "OTP expired" });
    }
    const isValidOtp = await compareEncryptedData(otp, isUser.otp);
    if (!isValidOtp) {
      return res.status(401).json({ error: true, message: "Invalid OTP" });
    }

    let token = jwt.sign({ email: isUser.email }, process.env.JWT_SECRET);
    await Users.updateOne(
      { _id: isUser._id },
      { $set: { otp: null, otp_expire: null, token } },
      { new: true }
    );
    res.status(200).json({
      error: false,
      message: "OTP verified successfully",
      data: isUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    let { username } = req.body;
    let isUser = await Users.findOne({
      $or: [{ email: username }, { mobile: username }],
    });
    if (!isUser) {
      return res.status(404).json({ message: "Invalid username" });
    }
    let otp = generateOtp();
    await MailSender(otp);
    let encOTP = await encryptedData(otp);
    await Users.updateOne(
      { _id: isUser._id },
      { $set: { otp: encOTP, otp_expire: Date.now() + 600000 } }
    ); // 10 min expiration time
    res.status(200).json({ error: true, message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};


export {
  signupUser,
  authenticateUser,
  verifyotp,
  resendOtp,
};
// Compare this snippet from server/Controllers/Cart.controller.js:
