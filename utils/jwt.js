const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const verifyToken = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachTokenToCookieAsResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + thirtyDays),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  }); // storing token into the cookie during creation instead of sending it as a response
};

const removeCookiesFromResponse = ({ res }) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
};

module.exports = {
  createJWT,
  verifyToken,
  attachTokenToCookieAsResponse,
  removeCookiesFromResponse,
};
