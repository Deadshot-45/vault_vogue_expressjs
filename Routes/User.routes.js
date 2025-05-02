import auth from "../Utils/auth.js";
import express from "express";
import uploadFile from "../Utils/multer.js";
import {
  getUser,
  updateUser,
  updateUserImg,
} from "../Controllers/User.controller.js";

let upload = uploadFile();

let routes = express.Router();

routes.get("/getuser", auth, getUser);
routes.put("/updateuser", auth, updateUser);
routes.post("/updateimg", auth, upload.single("file"), updateUserImg);

export default routes;
