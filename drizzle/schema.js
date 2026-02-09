import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const shortLinkTable = mysqlTable("short_links", {
  id: int().autoincrement().primaryKey(),
  short_code: varchar({ length: 20 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

//! Hybrid authentication
// Session table
export const sessionsTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  /* User agent is a header sent by the client's browser or application in a HTTP request. It provides information about the device, operating system, browser  */
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verifyEmailTokensTable = mysqlTable("is_email_valid", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: 8 }).notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP+INTERVAL 1 DAY)`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// a user can have many short links and many sessions
export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLink: many(shortLinkTable),
  session: many(sessionsTable),
  verifyEmailToken: many(verifyEmailTokensTable),
}));
// a short link belongs to a user
export const shortLinkRelation = relations(shortLinkTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinkTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));

// a session belong to only one user
export const sessionsRelation = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));

// an email verification token belongs to only one user
export const verifyEmailTokensRelation = relations(
  verifyEmailTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [verifyEmailTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);
