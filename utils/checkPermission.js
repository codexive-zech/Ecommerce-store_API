const { BadRequestError } = require("../errors");

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId?.toString()) return;
  throw new BadRequestError("Not Authorized To Access This Route");
};

module.exports = checkPermission;
