import express from "express";
import {
  getProducts,
  // addProduct,
  searchProduct,
  addProducts,
  getProduct,
  productQuery,
} from "../Controllers/Products.controller.js";
// import UploadFile from "../Utils/UploadFile.js";
// import multer from "multer";

const routes = express.Router();

// const upload = UploadFile();

routes.post("/addproducts", addProducts);
routes.get("/getproducts", getProducts);
routes.get("/getproduct/:id", getProduct);
routes.get("/productquery/:query", productQuery);
routes.get("/searchproduct/:query", searchProduct);

// routes.post(
//   "/addproduct",
//   upload.fields([
//     { name: "image", maxCount: 5 },
//     { name: "document", maxCount: 1 },
//   ]),
//   addProduct
// );

// routes.put(
//   "/updateproduct",
//   upload.fields([
//     { name: "image", maxCount: 5 },
//     { name: "document", maxCount: 1 },
//   ])
// );

export default routes;
// export default routes;
