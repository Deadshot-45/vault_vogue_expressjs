import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    required: true,
    default: [],
  },
  sizes: {
    type: [String],
    required: true,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: [String],
    default: [],
  },
  bestseller: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

const Product = model("Product", ProductSchema);
export default Product;
// export default ProductSchema;