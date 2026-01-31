import {
  getHomePage,
  postURL,
  redirectToShortCode,
  getLinks,
} from "../controllers/shortener.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getHomePage);

router.post("/", postURL);

router.get("/links", getLinks);

router.get("/:shortCode", redirectToShortCode);

export const homePageRouter = router;
