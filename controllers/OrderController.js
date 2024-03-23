const Order = require("../model/Order");
const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");
const checkPermission = require("../utils/checkPermission");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No Items Available In The Cart");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please Provide Tax and Shipping Fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const productInDB = await Product.findOne({ _id: item.product });
    if (!productInDB) {
      throw new BadRequestError(`No Product with ID ${item.product} Exist`);
    }
    const { name, price, image, _id } = productInDB;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  const total = subtotal + tax + shippingFee;
  const paymentIndent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    clientSecret: paymentIndent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new BadRequestError("No Order Exist with the ID :" + orderId);
  }
  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrder = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  const userOrders = orders.length < 1 ? [] : orders;
  checkPermission(req.user, orders.user);
  res.status(StatusCodes.OK).json({ userOrders, count: userOrders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIndentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new BadRequestError(`No Order with ID: ${orderId}`);
  }
  checkPermission(req.user, order.user);
  order.paymentIndentId = paymentIndentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrders,
  getCurrentUserOrder,
  getSingleOrder,
  updateOrder,
};
