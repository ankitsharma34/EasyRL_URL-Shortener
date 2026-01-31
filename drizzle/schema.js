import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const shortLinkTable = mysqlTable("short_links", {
  id: int().autoincrement().primaryKey(),
  short_code: varchar({ length: 20 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull(),
});
