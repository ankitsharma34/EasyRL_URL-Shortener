import {
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/auth.services.js";
import {
  loginUserSchema,
  registerUserSchema,
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
  console.log(user);
  return res.redirect("/login");
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
  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
  });
  res.cookie("access_token", token);
  return res.redirect("/");
};

export const getMe = (req, res) => {
  if (!req.user) return res.send("Not logged in");
  return res.send(`<h1> ${req.user.name} - ${req.user.email}</h1>`);
};
export const logoutUser = (req, res) => {
  res.clearCookie("access_token");
  return res.redirect("/login");
};
