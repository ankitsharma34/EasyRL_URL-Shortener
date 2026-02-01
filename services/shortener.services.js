// ! PRISMA

// import { prisma } from "../lib/prisma.js";

// export const loadLinks = async () => {
//   const allShortLinks = await prisma.short_links.findMany();
//   return allShortLinks;
// };

// export const getLinkByShortCode = async (shortCode) => {
//   const shortLink = await prisma.short_links.findUnique({
//     where: { short_code: shortCode },
//   });
//   return shortLink;
// };

// export const saveLinks = async ({ url, finalShortCode }) => {
//   const newShortLink = await prisma.short_links.create({
//     data: { short_code: finalShortCode, url },
//   });
//   return newShortLink;
// };

//! DRIZZLE

import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinkTable } from "../drizzle/schema.js";

export const loadLinks = async (userId) => {
  const allShortLinks = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.userId, userId));
  return allShortLinks;
};

export const getLinkByShortCode = async (shortCode) => {
  const [result] = await db.select().from(shortLinkTable).where({
    short_code: shortCode,
  });
  return result;
};

export const saveLinks = async ({ url, finalShortCode, userId }) => {
  await db
    .insert(shortLinkTable)
    .values({ url, short_code: finalShortCode, userId });
};
