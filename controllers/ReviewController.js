const Review = require("../model/Review");
const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/index");
const checkPermission = require("../utils/checkPermission");

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isProductValid = await Product.findOne({ _id: productId });
  if (!isProductValid) {
    throw new BadRequestError(`No Product With ID ${productId} Found`);
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new BadRequestError("Already Submitted Review For This Product");
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};

const getAllReview = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name price description company",
    })
    .populate({ path: "user", select: "name" });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new BadRequestError(`No Review Found For ID: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { title, comment, rating } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new BadRequestError("No Review with ID : " + reviewId);
  }
  checkPermission(req.user, review.user);
  review.title = title;
  review.comment = comment;
  review.rating = rating;

  await review.save();
  res.status(StatusCodes.OK).send({ review });
};
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new BadRequestError(`No Review Found For ID: ${reviewId}`);
  }
  checkPermission(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Successfully Delete Review" });
};

const getSingleProductReview = async (req, res) => {
  const { id: productId } = req.params;
  const productReview = await Review.findOne({ product: productId });
  if (!productReview) {
    throw new BadRequestError(`No Product Review Found For ID: ${productId}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ productReview, count: productReview.length });
};

module.exports = {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReview,
};
