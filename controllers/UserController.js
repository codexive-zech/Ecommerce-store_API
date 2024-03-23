const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors/index");
const createUserToken = require("../utils/createUserToken");
const { attachTokenToCookieAsResponse } = require("../utils");
const checkPermission = require("../utils/checkPermission");

const getAllUsers = async (req, res) => {
  const user = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ user });
};

const getSingleUser = async (req, res) => {
  const singleUserId = req.params.id;
  const user = await User.findOne({ _id: singleUserId }).select("-password");
  if (!user) {
    throw new BadRequestError(`No User Found with ID: ${singleUserId}`);
  }
  checkPermission(req.user, user._id);
  res.status(StatusCodes.OK).send({ user });
};
const showCurrentUser = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new UnauthenticatedError("User is Not Authenticated Yet");
  }
  res.status(StatusCodes.OK).json({ user });
};

// updating User with the Pre Save hook
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Please Provide Valid User Info");
  }

  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;
  await user.save();

  const tokenDetails = createUserToken(user);
  attachTokenToCookieAsResponse({ res, user: tokenDetails });
  res.status(StatusCodes.OK).json({ user: tokenDetails });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please Provide Valid Credentials for Passwords");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new BadRequestError("Old Password is Invalid");
  }
  user.password = newPassword;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "User Password Updated Successfully!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// updating User with findOneAndUpdate Mongoose Method
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     throw new BadRequestError("Please Provide Valid User Info");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenDetails = createUserToken(user);
//   attachTokenToCookieAsResponse({ res, user: tokenDetails });
//   res.status(StatusCodes.OK).json({ user: tokenDetails });
// };
