import { z } from "zod";
import "dotenv/config";
// const portSchema = z.coerce.number().min(1).max(65535).default(3000);
// export const PORT = portSchema.parse(process.env.PORT);

export const env = z
  .object({
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    //! mongo db
    // MONGODB_URI: z.string(),
    // MONGODB_DATABASE_NAME: z.string(),

    //! mysql & prisma
    // DATABASE_HOST: z.string(),
    // DATABASE_USER: z.string(),
    // DATABASE_PASSWORD: z.string(),
    // DATABASE_NAME: z.string(),

    // ! drizzle
    DATABASE_URL: z.string(),

    // ! JWT
    JWT_SECRET: z.string(),

    // ! express-session
    SESSION_SECRET: z.string(),
  })
  .parse(process.env);
