const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const {
  attachTokenToCookieAsResponse,
  removeCookiesFromResponse,
} = require("../utils");
const { BadRequestError, UnauthenticatedError } = require("../errors/index");
const createUserToken = require("../utils/createUserToken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // first user to register should be an ADMIN
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const tokenDetails = createUserToken(user);
  attachTokenToCookieAsResponse({ res, user: tokenDetails });
  res.status(StatusCodes.CREATED).json({ user: tokenDetails });
};

const login = async (req, res) => {
  const { password, email } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please Provide valid email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credential For User");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Provide valid Password");
  }

  const tokenDetails = createUserToken(user);
  attachTokenToCookieAsResponse({ res, user: tokenDetails });
  res.status(StatusCodes.OK).json({ user: tokenDetails });
};

const logout = async (req, res) => {
  removeCookiesFromResponse({ res });
  res.status(StatusCodes.OK).json({ msg: "User Logged Out Successfully!" });
};

module.exports = { register, login, logout };
