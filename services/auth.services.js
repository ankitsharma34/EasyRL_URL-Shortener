import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";
import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

export const createUser = async ({ name, email, password }) => {
  return db.insert(usersTable).values({ name, email, password }).$returningId();
};

export const hashPassword = async (password) => {
  // return await bcrypt.hash(password, 10);  // hash(password,salting value)
  return await argon2.hash(password);
};

export const verifyPassword = async (password, hashedPassword) => {
  // return await bcrypt.compare(password, hashedPassword);
  return await argon2.verify(hashedPassword, password);
};

// ! JWT

export const generateToken = ({ id, name, email }) => {
  return jwt.sign({ id, name, email }, env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const verifyJWTToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
