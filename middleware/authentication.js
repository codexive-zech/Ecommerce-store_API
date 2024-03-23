const { BadRequestError, UnauthenticatedError } = require("../errors");
const UnauthorizedError = require("../errors/unathorized");
const { verifyToken } = require("../utils");

const authenticateUser = (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("Error, No Token Found.");
  }

  try {
    const payload = verifyToken({ token });

    req.user = {
      name: payload.name,
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new BadRequestError("Error, Authentication Invalid.");
  }
};

const authorizedPermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized To Access This Route");
    }
    next();
  }; // stating the callback func
};

module.exports = { authenticateUser, authorizedPermission };
