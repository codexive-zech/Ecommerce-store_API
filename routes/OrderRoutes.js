const express = require("express");

const router = express.Router();
const {
  authenticateUser,
  authorizedPermission,
} = require("../middleware/authentication");

const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
} = require("../controllers/OrderController");

router
  .route("/")
  .get(authenticateUser, authorizedPermission("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrder);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
