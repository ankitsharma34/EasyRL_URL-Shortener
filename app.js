import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import express from "express";
import requestIp from "request-ip";
import { env } from "./config/env.js";
import { homePageRouter } from "./routers/homePage.route.js";
import { authRoute } from "./routers/auth.routes.js";
import { verifyAuthentication } from "./middlewares/verify-auth.middlewares.js";
import { setUser } from "./middlewares/setUsers.middleware.js";
// !mongoose
// import { connectDB } from "./config/db-client.js";

const app = express();

// ----Middlewares ---
const staticPath = path.join(import.meta.dirname, "public");
const viewsPath = path.join(import.meta.dirname, "views");
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", viewsPath);

// --- SERVER LOGIC ---
app.use(cookieParser());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  }),
);
app.use(flash());
app.use(requestIp.mw());
app.use(verifyAuthentication);
app.use(setUser);
app.use(authRoute);
app.use(homePageRouter);

try {
  // !mongoose
  // await connectDB();

  app.listen(env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${env.PORT}`);
  });
} catch (error) {
  console.error(error);
}
