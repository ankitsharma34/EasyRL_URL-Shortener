import crypto from "crypto";
import z from "zod";
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
  deleteShortCodeById,
  findShortLinkById,
  getLinkByShortCode,
  loadLinks,
  saveLinks,
  updateShortCode,
} from "../services/shortener.services.js";

export const getHomePage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    // !mongodb & mysql &  prisma & drizzle
    const links = await loadLinks(req.user.id);
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

    return res.render("index", {
      links,
      host: req.host,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }
};

export const postURL = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    // !mongodb & mysql & prisma & drizzle
    const links = await loadLinks();
    // ! mongoose
    // const links = await urls.find();

    const link = await getLinkByShortCode(finalShortCode);
    if (link) {
      req.flash("errors", "URL with that short code already exists.");
      return res.redirect("/");
    }

    // ! fs module = json
    // links[finalShortCode] = url;
    // await saveLinks(links);
    // !Mongodb & mysql & prisma & drizzle
    await saveLinks({ url, finalShortCode, userId: req.user.id });
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

export const getShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.redirect("/404");
  }
  try {
    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.redirect("/404");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.short_code,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};
export const postShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.redirect("/404");
  }

  try {
    const { url, shortCode } = req.body;
    const newUpdatedShortCode = await updateShortCode({ id, url, shortCode });
    if (!newUpdatedShortCode) return res.redirect("/404");
    res.redirect("/");
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      req.flash("errors", "Short Code already exist. Please choose another.");
      return res.redirect(`/edit/${id}`);
    }
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const deleteShortCode = async (req, res) => {
  try {
    const { data: id, error } = z.coerce
      .number()
      .int()
      .safeParse(req.params.id);
    if (error) return res.redirect("/404");

    await deleteShortCodeById(id);
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};
