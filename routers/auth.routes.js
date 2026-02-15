import { Router } from "express";
import {
  getChangePasswordPage,
  getEditProfilePage,
  getLoginPage,
  getMe,
  getProfilePage,
  getRegisterPage,
  getVerifyEmailPage,
  logoutUser,
  postChangePassword,
  postEditProfile,
  postLogin,
  postRegister,
  resendVerificationLink,
  verifyEmailToken,
} from "../controllers/auth.controllers.js";

const router = Router();

// router.get("/register", getRegisterPage);
// router.get("/login", getLoginPage);
// router.post("/login", postLogin);

router.route("/register").get(getRegisterPage).post(postRegister);
router.route("/login").get(getLoginPage).post(postLogin);
router.route("/me").get(getMe);
router.get("/profile", getProfilePage);
router.route("/edit-profile").get(getEditProfilePage).post(postEditProfile);
router
  .route("/change-password")
  .get(getChangePasswordPage)
  .post(postChangePassword);

router.route("/verify-email").get(getVerifyEmailPage);
router.route("/resend-verification-link").post(resendVerificationLink);
router.route("/verify-email-token").get(verifyEmailToken);
router.route("/logout").get(logoutUser);

export const authRoute = router;
