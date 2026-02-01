import path from "path";
import { env } from "./config/env.js";
import express from "express";
import { homePageRouter } from "./routers/homePage.route.js";
import { authRoute } from "./routers/auth.routes.js";
import cookieParser from "cookie-parser";
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
