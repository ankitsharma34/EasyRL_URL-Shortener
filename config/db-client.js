// ! mongo db
// import { MongoClient } from "mongodb";
// import { env } from "./env.js";

// export const dbClient = new MongoClient(env.MONGODB_URI);

// import mongoose from "mongoose";
// import { env } from "./env.js";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(env.MONGODB_URI, {
//       dbName: env.MONGODB_DATABASE_NAME,
//     });
//     console.log("✅ MongoDB connected successfully");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//     process.exit(1);
//   }
// };

// ! MYSQL
// import mysql from "mysql2/promise";
// import { env } from "./env.js";

// export const db = await mysql.createConnection({
//   host: env.DATABASE_HOST,
//   user: env.DATABASE_USER,
//   password: env.DATABASE_PASSWORD,
//   database: env.DATABASE_NAME,
// });
