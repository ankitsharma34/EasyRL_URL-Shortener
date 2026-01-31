import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./config/env.js";

export default defineConfig({
  out: "./drizzle/migration",
  schema: "./drizzle/schema.js",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
