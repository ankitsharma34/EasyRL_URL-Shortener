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

import { count, desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinkTable } from "../drizzle/schema.js";

export const loadLinks = async ({ userId, limit = 10, offset = 0 }) => {
  const condition = eq(shortLinkTable.userId, userId);
  const allShortLinks = await db
    .select()
    .from(shortLinkTable)
    .where(condition)
    .orderBy(desc(shortLinkTable.createdAt))
    .limit(limit)
    .offset(offset);
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(shortLinkTable)
    .where(condition);
  return { allShortLinks, totalCount };
};

export const getLinkByShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.short_code, shortCode));
  return result;
};

export const saveLinks = async ({ url, finalShortCode, userId }) => {
  await db
    .insert(shortLinkTable)
    .values({ url, short_code: finalShortCode, userId });
};

export const findShortLinkById = async (id) => {
  const [result] = await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.id, id));
  return result;
};

export const updateShortCode = async ({ id, url, shortCode }) => {
  return await db
    .update(shortLinkTable)
    .set({ url, short_code: shortCode })
    .where(eq(shortLinkTable.id, id));
};

export const deleteShortCodeById = async (id) => {
  return await db.delete(shortLinkTable).where(eq(shortLinkTable.id, id));
};
