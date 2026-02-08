import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  sessionsTable,
  shortLinkTable,
  usersTable,
} from "../drizzle/schema.js";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";

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

// export const generateToken = ({ id, name, email }) => {
//   return jwt.sign({ id, name, email }, env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

// ! hybrid authentication
export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // 15 minute
  });
};
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // 1 week
  });
};

export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();
  return session;
};

export const getSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  return session;
};
export const getUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user;
};

export const verifyJWTToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const refreshRefreshToken = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);
    const currentSession = await getSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid session");
    }

    const user = await getUserById(currentSession.userId);
    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);
    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.error(error.message);
  }
};

export const clearUserSession = async (sessionId) => {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};

export const createSessionAndTokens = async ({
  req,
  res,
  user,
  name,
  email,
}) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.header["user-agent"],
  });
  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: user.isEmailValid || false,
    sessionId: session.id,
  });
  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };
  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });
  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinkTable)
    .where(eq(shortLinkTable.userId, userId));
};
