// import path,{dirname} from "path"
// import { fileURLToPath } from "url";
// import fs from "fs/promises"
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const DATA_FILE = path.join(__dirname,"..", "data", "links.json");
// export const loadLinks = async () => {
//     try {
//         const data = await fs.readFile(DATA_FILE, "utf-8");
//         // --- FIX ---
//         // If the file is empty (e.g., after being created), return an empty
//         // object to prevent a JSON.parse() error on an empty string.
//         if (!data) {
//             return {};
//         }
//         return JSON.parse(data);
//     } catch (error) {
//         // If the file doesn't exist (error code 'ENOENT'), create it.
//         if (error.code === 'ENOENT') {
//             await fs.writeFile(DATA_FILE, JSON.stringify({}));
//             return {};
//         }
//         // For any other error, re-throw it to be handled by the caller.
//         throw error;
//     }
// };

// export const saveLinks = async (links) => {
//     // Using JSON.stringify with a replacer (null) and space count (2) for pretty-printing.
//     await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
// };

// ! USING MONGO DB

// import { dbClient } from "../config/db-client.js";
// import { env } from "../config/env.js";

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shorteners");

// export const loadLinks = async () => {
//   return shortenerCollection.find().toArray();
// };

// export const saveLinks = async (link) => {
//   return shortenerCollection.insertOne(link);
// };

// export const getLinkByShortCode = async (shortCode) => {
//   return await shortenerCollection.findOne({ shortCode: shortCode });
// };

// ! USING My SQL

import { db } from "../config/db-client.js";

export const loadLinks = async () => {
  const [rows] = await db.execute(`SELECT * FROM short_links`);
  return rows.map((row) => ({
    ...row,
    shortCode: row.short_code,
  }));
};
export const saveLinks = async ({ url, finalShortCode }) => {
  const [result] = await db.execute(
    `insert into short_links(short_code,url) values(?,?)`,
    [finalShortCode, url],
  );
  return result;
};
export const getLinkByShortCode = async (shortCode) => {
  const [rows] = await db.execute(
    `select * from short_links where short_code = ?`,
    [shortCode],
  );
  if (rows.length > 0) {
    return rows[0];
  } else {
    return null;
  }
};
