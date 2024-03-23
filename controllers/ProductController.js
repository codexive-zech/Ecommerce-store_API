const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors/index");
const path = require("path");
const createProduct = async (req, res) => {
  req.body.userId = req.user.userId; // attaching the Id of the User to the product created.
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
  res.send("Create Product");
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate({
    path: "reviews",
  });

  if (!product) {
    throw new BadRequestError(`No Product With ID : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new BadRequestError(`No Product With ID : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new BadRequestError(`No Product With ID : ${productId}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product Removed Successfully!" });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No File Upload");
  } // checking to see if a file was uploaded

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please Upload Image Files");
  } // checking to see the format of the file

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError("Please Upload Image Less than 1MB");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
