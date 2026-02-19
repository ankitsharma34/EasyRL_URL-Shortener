import { Router } from "express";
import {
  getChangePasswordPage,
  getEditProfilePage,
  getForgotPasswordPage,
  getGithubLoginCallback,
  getGithubLoginPage,
  getGoogleLoginCallback,
  getGoogleLoginPage,
  getLoginPage,
  getMe,
  getProfilePage,
  getRegisterPage,
  getResetPasswordPage,
  getVerifyEmailPage,
  logoutUser,
  postChangePassword,
  postEditProfile,
  postForgotPassword,
  postLogin,
  postRegister,
  postResetPassword,
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

router
  .route("/forgot-password")
  .get(getForgotPasswordPage)
  .post(postForgotPassword);
router
  .route("/reset-password/:token")
  .get(getResetPasswordPage)
  .post(postResetPassword);

router.route("/verify-email").get(getVerifyEmailPage);
router.route("/resend-verification-link").post(resendVerificationLink);
router.route("/verify-email-token").get(verifyEmailToken);

router.route("/google").get(getGoogleLoginPage);
router.route("/google/callback").get(getGoogleLoginCallback);

router.route("/github").get(getGithubLoginPage);
router.route("/github/callback").get(getGithubLoginCallback);

router.route("/logout").get(logoutUser);

export const authRoute = router;
