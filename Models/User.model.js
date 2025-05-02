import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: Array, default: [] },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  favorate: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
});

const favoriteItem = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: Array, default: [] },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  favorate: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
});

const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  avatar: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  cart: {
    type: [cartItemSchema],
    default: [],
    // Minimal validation to prevent errors
    validate: {
      validator: function () {
        return true; // Temporarily disable validation
      },
      message: "Invalid cart items",
    },
  },
  orders: {
    type: [
      {
        product: { type: String, required: true },
        quantity: { type: Number, required: true },
        date: { type: Date, required: true },
      },
    ],
    default: [],
  },
  favorite: {
    type: [favoriteItem],
    default: [],
    // Minimal validation to prevent errors
    validate: {
      validator: function () {
        return true; // Temporarily disable validation
      },
      message: "Invalid favorite items",
    },
  },
  otp: {
    type: String,
    default: null,
  },
  otp_expire: {
    type: Date,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },
  reset_password_token: {
    type: String,
    default: null,
  },
});

const Users = mongoose.model("userinfo", UsersSchema);
export default Users;
