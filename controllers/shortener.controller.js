import crypto from "crypto";

// ! mongodb & mysql
// import {
//   getLinkByShortCode,
//   loadLinks,
//   saveLinks,
// } from "../models/shortener.model.js";

// ! mongoose
// import { urls } from "../schema/url_schema.js";

// ! prisma & drizzle
import {
  getLinkByShortCode,
  loadLinks,
  saveLinks,
} from "../services/shortener.services.js";

export const getHomePage = async (req, res) => {
  try {
    // !mongodb & mysql &  prisma & drizzle
    const links = await loadLinks();
    // !mongoose
    // const links = await urls.find();

    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = Boolean(
    //   isLoggedIn
    //     ?.split(";")
    //     ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
    //     ?.split("=")[1],
    // );

    // ! cookie
    // let isLoggedIn = req.cookies.isLoggedIn; // * cookie-parser
    // return res.render("index", { links, host: req.host, isLoggedIN });

    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }
};

export const postURL = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    // !mongodb & mysql & prisma & drizzle
    const links = await loadLinks();
    // ! mongoose
    // const links = await urls.find();

    if (links.find((link) => link.shortCode === finalShortCode)) {
      return res.status(400).json({
        success: false,
        message: "Short code already exists. Please choose another.",
      });
    }

    // ! fs module = json
    // links[finalShortCode] = url;
    // await saveLinks(links);
    // !Mongodb & mysql & prisma & drizzle
    await saveLinks({ url, finalShortCode });
    // ! mongoose
    // await urls.create({ url, shortCode: finalShortCode });

    return res.status(201).redirect("/");
    // return res.status(201).json({
    //   success: true,
    //   shortCode: finalShortCode,
    //   message: "URL shortened successfully!",
    // });
  } catch (error) {
    console.error("Error in POST /shorten:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error.",
    });
  }
};

export const getLinks = async (req, res) => {
  try {
    // !mongo db & mysql & prisma & drizzle
    const links = await loadLinks();
    //! mongoose
    // const links = await urls.find();

    return res.json(links);
  } catch (error) {
    console.error("Error in GET /links:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export const redirectToShortCode = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // ! fs module
    // const links = await loadLinks();
    // ! mongodb & mysql & prisma & drizzle
    const link = await getLinkByShortCode(shortCode);
    //! mongoose
    // const link = await urls.findOne({ shortCode: shortCode });

    if (!link) return res.status(404).send("404 Error Occurred");
    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
