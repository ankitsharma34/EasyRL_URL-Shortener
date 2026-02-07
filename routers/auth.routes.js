import { Router } from "express";
import {
  getLoginPage,
  getMe,
  getProfilePage,
  getRegisterPage,
  logoutUser,
  postLogin,
  postRegister,
} from "../controllers/auth.controllers.js";

const router = Router();

// router.get("/register", getRegisterPage);
// router.get("/login", getLoginPage);
// router.post("/login", postLogin);

router.route("/register").get(getRegisterPage).post(postRegister);
router.route("/login").get(getLoginPage).post(postLogin);
router.route("/me").get(getMe);
router.route("/logout").get(logoutUser);
router.get("/profile", getProfilePage);

export const authRoute = router;
