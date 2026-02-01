export const setUser = (req, res, next) => {
  res.locals.user = req.user;
  return next();
};
/**
 * How it works:
 * this middleware runs on every request before reaching the route handlers.
 * res.locals is an object that persists throughout the request-response cycle
 * if req.user exists (typically from authentication like passport.js),it is stored in res.locals.user
 *
 * Views (like ejs , pug and handlebars) can directly access user without manually passing it in every route
 */
