import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Users Table
export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  password: varchar({ length: 255 }),
  avatarURL: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Short Links Table
export const shortLinkTable = mysqlTable("short_links", {
  id: int().autoincrement().primaryKey(),
  short_code: varchar({ length: 20 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

// Sessions Table
export const sessionsTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Verify Email Tokens
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

// Password Reset Tokens
export const passwordResetTokensTable = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP+INTERVAL 1 HOUR)`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OAuth Accounts Table
export const oAuthAccountsTable = mysqlTable("oauth_accounts", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["google", "github"]).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS

export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLink: many(shortLinkTable),
  session: many(sessionsTable),
  verifyEmailToken: many(verifyEmailTokensTable),
  oauthAccount: many(oAuthAccountsTable),
}));

export const shortLinkRelation = relations(shortLinkTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinkTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsRelation = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const verifyEmailTokensRelation = relations(
  verifyEmailTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [verifyEmailTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const oAuthAccountsRelation = relations(
  oAuthAccountsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [oAuthAccountsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
