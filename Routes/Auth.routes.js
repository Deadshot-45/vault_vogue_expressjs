import express from "express";
// import auth from "../Utils/auth";

import {
  authenticateUser,
  signupUser,
  verifyotp,
  resendOtp,
} from "../Controllers/Authorization.controller.js";

let routes = express.Router();

routes.post("/login", authenticateUser);
routes.post("/signup", signupUser);
routes.post("/verifyotp", verifyotp);
routes.post("/resendotp", resendOtp);


export default routes;
// export default routes;
