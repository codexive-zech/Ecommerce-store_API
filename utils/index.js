const {
  createJWT,
  verifyToken,
  attachTokenToCookieAsResponse,
  removeCookiesFromResponse,
} = require("../utils/jwt");

module.exports = {
  createJWT,
  verifyToken,
  attachTokenToCookieAsResponse,
  removeCookiesFromResponse,
};
