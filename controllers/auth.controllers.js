import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { sendEmail } from "../lib/nodemailer.js";
import {
  clearEmailVerificationTokens,
  clearUserSession,
  createAccessToken,
  createRefreshToken,
  createSession,
  createSessionAndTokens,
  createUser,
  createVerificationEmailLink,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  // generateToken,
  getUserByEmail,
  getUserById,
  getVerificationToken,
  hashPassword,
  insertEmailVerificationToken,
  sendNewVerificationLink,
  verifyPassword,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";
import {
  loginUserSchema,
  registerUserSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";

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
