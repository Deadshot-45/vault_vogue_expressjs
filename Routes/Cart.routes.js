import express from "express";
import auth from "../Utils/auth.js";
import {
  getCart,
  updateCartProduct,
  deleteCartProduct,
  addToCart,
  getFavorate,
  updateFavorate,
} from "../Controllers/Cart.controller.js";

const routes = express.Router();

routes.post("/favorates", auth, getFavorate);
routes.put("/updatefavorate", auth, updateFavorate)
routes.get("/getcart", auth, getCart);
routes.post("/updatecart", auth, updateCartProduct); // update quantity of product in cart when login
routes.put("/addtocart", auth, addToCart);
routes.delete("/deletecartproduct/:_id", auth, deleteCartProduct);

export default routes;
