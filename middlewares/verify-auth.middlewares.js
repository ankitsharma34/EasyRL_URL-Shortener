import { verifyJWTToken } from "../services/auth.services.js";

export const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    /**
     * ! You can add any property to req, BUT:
     * avoid overwriting the existing properties
     * use req.user for authentication
     * group custom properties under req.custom if needed
     * keep the data light weight
     */
    req.user = null;
    return next();
  }
  try {
    const decodedToken = verifyJWTToken(token);
    req.user = decodedToken;
  } catch (error) {
    req.user = null;
  }
  return next();
};
