import { Router } from "express";
import {
  getLoginPage,
  getRegisterPage,
  postLogin,
} from "../controllers/auth.controllers.js";

const router = Router();

// router.get("/register", getRegisterPage);
// router.get("/login", getLoginPage);
// router.post("/login", postLogin);

router.route("/register").get(getRegisterPage).post(postRegister);
router.route("/login").get(getLoginPage).post(postLogin);

export const authRoute = router;
