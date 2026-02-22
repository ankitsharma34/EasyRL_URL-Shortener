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
  getSetPasswordPage,
  getVerifyEmailPage,
  logoutUser,
  postChangePassword,
  postEditProfile,
  postForgotPassword,
  postLogin,
  postRegister,
  postResetPassword,
  postSetPassword,
  resendVerificationLink,
  verifyEmailToken,
} from "../controllers/auth.controllers.js";
import multer from "multer";
import path from "path";

const router = Router();

// router.get("/register", getRegisterPage);
// router.get("/login", getLoginPage);
// router.post("/login", postLogin);

router.route("/register").get(getRegisterPage).post(postRegister);
router.route("/login").get(getLoginPage).post(postLogin);
router.route("/me").get(getMe);
router.get("/profile", getProfilePage);

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatar");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random()}${ext}`);
  },
});

const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
});

// router.route("/edit-profile").get(getEditProfilePage).post(postEditProfile);
router
  .route("/edit-profile")
  .get(getEditProfilePage)
  .post(avatarUpload.single("avatar"), postEditProfile);
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

router.route("/set-password").get(getSetPasswordPage).post(postSetPassword);

router.route("/logout").get(logoutUser);

export const authRoute = router;
