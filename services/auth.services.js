import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
import {
  sessionsTable,
  shortLinkTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { sendEmail } from "../lib/nodemailer.js";

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

export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

export const insertEmailVerificationToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));
      return tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      console.log("Failed to insert verification token: ", error);
      throw new Error("unable to create verification token");
    }
  });
};
/**
 * * URL API in JS provides an easy way to construct, manipulate, and parse URLs without manual
 * * string concatenation. It ensures correct encoding, readability, and security when handling URLs
 *
 * ! Why use URL API??
 * 1. Easier URL Construction
 * 2. Automatic encoding
 * 3. Better readability
 */
export const createVerificationEmailLink = async ({
  protocol,
  host,
  email,
  token,
}) => {
  // const uriEncodedEmail = encodeURIComponent(email);
  // return `${protocol}://${host}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;

  const url = new URL(`${protocol}://${host}/verify-email-token`);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return url.toString();
};

export const getVerificationToken = async ({ userId, token }) => {
  const [verificationToken] = await db
    .select()
    .from(verifyEmailTokensTable)
    .where(
      eq(verifyEmailTokensTable.userId, userId),
      eq(verifyEmailTokensTable.token, token),
    );
  return verificationToken;
};

export const findVerificationEmailToken = async ({ token, email }) => {
  // const tokenData = await db
  //   .select({
  //     userId: verifyEmailTokensTable.userId,
  //     token: verifyEmailTokensTable.token,
  //     expiresAt: verifyEmailTokensTable.expiresAt,
  //   })
  //   .from(verifyEmailTokensTable)
  //   .where(
  //     and(
  //       eq(verifyEmailTokensTable.token, token),
  //       gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
  //     ),
  //   );
  // if (!token.length) {
  //   return null;
  // }
  // const { userId } = tokenData[0];
  // const userData = await db
  //   .select({
  //     userId: usersTable.id,
  //     email: usersTable.email,
  //   })
  //   .from(usersTable)
  //   .where(eq(usersTable.id, userId));
  // if (!userData.length) {
  //   return null;
  // }
  // return {
  //   userId: userData[0].userId,
  //   email: userData[0].email,
  //   token: userData[0].token,
  //   expiresAt: userData[0].expiresAt,
  // };

  //! using SQL joins
  return await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
        eq(usersTable.email, email),
      ),
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

export const verifyUserEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};
export const clearEmailVerificationTokens = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

export const sendNewVerificationLink = async ({
  userId,
  email,
  protocol,
  host,
}) => {
  const randomToken = generateRandomToken();

  await insertEmailVerificationToken({
    userId,
    token: randomToken,
  });
  const verificationEmailLink = await createVerificationEmailLink({
    protocol,
    host,
    email,
    token: randomToken,
  });

  sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
          <h1>Click the link below to verify your email</h1>
          <p>You can use this token: ${randomToken}</p>
          <a href="${verificationEmailLink}">Verify Email</a>
      `,
  }).catch(console.error);
};
