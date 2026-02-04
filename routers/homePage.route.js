import {
  getHomePage,
  postURL,
  redirectToShortCode,
  getLinks,
  getShortenerEditPage,
  postShortenerEditPage,
  deleteShortCode,
} from "../controllers/shortener.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getHomePage);

router.post("/", postURL);

router.get("/links", getLinks);

router.get("/:shortCode", redirectToShortCode);

router.route("/edit/:id").get(getShortenerEditPage).post(postShortenerEditPage);

router.route("/delete/:id").post(deleteShortCode);
export const homePageRouter = router;
