import {
  decodeIdToken,
  generateCodeVerifier,
  generateState,
  Google,
} from "arctic";
import {
  ACCESS_TOKEN_EXPIRY,
  OAUTH_EXCHANGE_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { getHTMLfromMJMLTemplate } from "../lib/get-html-from-mjml.js";
import { sendEmail } from "../lib/nodemailer.js";
import { resendEmail } from "../lib/resend-email.js";
import {
  clearEmailVerificationTokens,
  clearResetPasswordToken,
  clearUserSession,
  createAccessToken,
  createRefreshToken,
  createResetPasswordLink,
  createSession,
  createSessionAndTokens,
  createUser,
  createVerificationEmailLink,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  getResetPasswordToken,
  // generateToken,
  getUserByEmail,
  getUserById,
  getUserWithOauthId,
  getVerificationToken,
  hashPassword,
  insertEmailVerificationToken,
  linkUserWithOauth,
  sendNewVerificationLink,
  updateUserByName,
  updateUserPassword,
  verifyPassword,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";
import {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  verifyEmailSchema,
  verifyPasswordSchema,
  verifyResetPasswordSchema,
  verifyUserSchema,
} from "../validators/auth.validator.js";
import { google } from "../lib/oauth/google.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/register", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");
  // const { name, email, password } = req.body;

  // !zod validation
  const result = registerUserSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const errorMessage = issue?.message || "Invalid input";
    req.flash("errors", errorMessage);
    return res.redirect("/register");
  }
  const { name, email, password } = result.data;

  const userExists = await getUserByEmail(email);
  if (userExists) {
    req.flash("errors", "User already exists.");
    return res.redirect("/register");
  }

  const hashedPassword = await hashPassword(password);
  const [user] = await createUser({ name, email, password: hashedPassword });
  // console.log(user);

  // return res.redirect("/login");

  // ! Auto login after registration
  await createSessionAndTokens({ req, res, user, name, email });

  await sendNewVerificationLink({
    userId: user.id,
    email,
    protocol: req.protocol,
    host: req.host,
  });
  return res.redirect("/verify-email");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");
  // const { email, password } = req.body;

  // ! zod validation
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const errorMessage = issue?.message || "Invalid Input";
    req.flash("errors", errorMessage);
    return res.redirect("/login");
  }
  const { email, password } = result.data;

  const user = await getUserByEmail(email);
  if (!user) {
    req.flash("errors", "Invalid email or password.");
    return res.redirect("/login");
  }

  if (!user.password) {
    req.flash(
      "errors",
      "You have created account using social login. Please login with your social account",
    );
    return res.redirect("/login");
  }

  //* format: bcrypt.compare(plainTextPassword,hashedPassword)
  const isPasswordValid = await verifyPassword(password, user.password);

  // if (user.password !== password) return res.redirect("/login");
  if (!isPasswordValid) {
    req.flash("errors", "Invalid email or password.");
    return res.redirect("/login");
  }

  // !cookie
  //   res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;");
  // res.cookie("isLoggedIn", true); //-> cookie parser and express automatically set the path to / by default

  // ! JWT
  // const token = generateToken({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  // });

  // res.cookie("access_token", token);
  // !hybrid authentication
  await createSessionAndTokens({ req, res, user });

  return res.redirect("/");
};

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in");
  return res.send(`<h1> ${req.user.name} - ${req.user.email}</h1>`);
};
export const logoutUser = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  await clearUserSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res.redirect("/login");
};

// profile page
export const getProfilePage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const user = await getUserById(req.user.id);
  if (!user) return res.redirect("/login");

  const userShortLinks = await getAllShortLinks(user.id);
  return res.render("auth/profile", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      createdAt: user.createdAt,
      links: userShortLinks,
    },
  });
};

// email verification
export const getVerifyEmailPage = async (req, res) => {
  // if (!req.user || req.user.isEmailValid) return res.redirect("/");
  if (!req.user) return res.redirect("/");
  const user = await getUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect("/");
  return res.render("auth/verify-email", {
    email: req.user.email,
    errors: req.flash("errors"),
  });
};

export const resendVerificationLink = async (req, res) => {
  if (!req.user) return res.redirect("/");
  const user = await getUserById(req.user.id);
  if (!user || user.isEmailValid) return res.redirect("/");

  await sendNewVerificationLink({
    userId: req.user.id,
    email: req.user.email,
    protocol: req.protocol,
    host: req.host,
  });

  res.redirect("/verify-email");
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);
  if (error) {
    return res.send("verification link invalid or expired");
  }

  // const token = await findVerificationEmailToken(data);  //! without joins
  const [token] = await findVerificationEmailToken(data); //! with sql joins
  console.log("Token: ", token);
  if (!token) {
    res.flash("errors", "Verification link/code expired or invalid.");
    return res.redirect("/verify-email");
  }

  await verifyUserEmailAndUpdate(token.email);
  clearEmailVerificationTokens(token.email);
  return res.redirect("/profile");
};

// EDIT PROFILE PAGE
export const getEditProfilePage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const user = await getUserById(req.user.id);
  if (!user) return res.status(400).send("User not found");
  return res.render("auth/edit-profile", {
    username: user.name,
    errors: req.flash("errors"),
  });
};

export const postEditProfile = async (req, res) => {
  if (!req.user) return res.redirect("/");
  const { data, error } = verifyUserSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/edit-profile");
  }
  await updateUserByName({ userId: req.user.id, name: data.name });
  return res.redirect("/profile");
};

// change password
export const getChangePasswordPage = async (req, res) => {
  if (!req.user) return res.redirect("/");
  return res.render("auth/change-password", {
    errors: req.flash("errors"),
  });
};

export const postChangePassword = async (req, res) => {
  const { data, error } = verifyPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessages = error.issues.map((err) => err.message);
    req.flash("errors", errorMessages);
    return res.redirect("/change-password");
  }

  const { currentPassword, newPassword } = data;
  const user = await getUserById(req.user.id);
  if (!user) return res.status(400).send("User not found");

  const isPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    req.flash("errors", "Current Password is incorrect.");
    return res.redirect("/change-password");
  }
  await updateUserPassword({ userId: user.id, newPassword });
  return res.redirect("/profile");
};

// RESET PASSWORD
export const getForgotPasswordPage = async (req, res) => {
  return res.render("auth/forgot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
  });
};

export const postForgotPassword = async (req, res) => {
  const { data, error } = forgotPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessages = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages[0]);
    return res.redirect("/reset-password");
  }
  const user = await getUserByEmail(data.email);

  if (user) {
    const resetPasswordLink = await createResetPasswordLink({
      userId: user.id,
      protocol: req.protocol,
      host: req.host,
    });
    const html = await getHTMLfromMJMLTemplate("reset-password-email", {
      name: user.name,
      link: resetPasswordLink,
    });
    resendEmail({ to: user.email, subject: "RESET YOUR PASSWORD", html });
  }

  req.flash("formSubmitted", true);
  return res.redirect("/forgot-password");
};

export const getResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  const resetPasswordData = getResetPasswordToken(token);
  if (!resetPasswordData) {
    return res.render("auth/wrong-reset-password-token");
  }
  return res.render("auth/reset-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  });
};

export const postResetPassword = async (req, res) => {
  const { token } = req.params;
  const resetPasswordData = await getResetPasswordToken(token);
  if (!resetPasswordData) {
    return res.render("auth/wrong-reset-password-token");
  }
  const { data, error } = verifyResetPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessages = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages[0]);
    return res.redirect("/reset-password");
  }
  const { newPassword } = data;
  const user = await getUserById(resetPasswordData.userId);
  await clearResetPasswordToken(user.id);

  await updateUserPassword({ userId: user.id, newPassword });

  return res.redirect("/login");
};

// LOGIN WITH GOOGLE

export const getGoogleLoginPage = async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = [
    "openid", // gives token if needed
    "profile", // gives user information
    // we are telling the google, what we require about the user
    "email",
  ];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);
  const cookieConfig = {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: OAUTH_EXCHANGE_EXPIRY,
    sameSite: "lax",
  };

  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  res.redirect(url.toString());
};

export const getGoogleLoginCallback = async (req, res) => {
  // google redirect code and state in query params
  const { code, state } = req.query;
  console.log(code, state);
  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;
  if (
    !code ||
    !state | !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login Attempt.Please try again.",
    );
    return res.redirect("/login");
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login Attempt.Please try again.",
    );
    return res.redirect("/login");
  }
  console.log("token google:", tokens);

  const claims = decodeIdToken(tokens.idToken());
  const { sub: googleUserId, name, email } = claims;

  // if the user already linked, then we will get the user
  let user = await getUserWithOauthId({ provider: "google", email });

  // if userExist but user is not linked with oauth
  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  // if user does not exist
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  await createSessionAndTokens({ req, res, user, name, email });
  res.redirect("/");
};
