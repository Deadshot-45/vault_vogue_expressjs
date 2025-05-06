import express from "express";
import auth from "../Utils/auth.js";

import {
  authenticateUser,
  signupUser,
  verifyotp,
  resendOtp,
  logoutUser,
} from "../Controllers/Authorization.controller.js";

let routes = express.Router();

routes.post("/login", authenticateUser);
routes.post("/signup", signupUser);
routes.post("/verifyotp", verifyotp);
routes.post("/resendotp", resendOtp);
routes.post("/user/logout", auth, logoutUser);

export default routes;
// export default routes;
