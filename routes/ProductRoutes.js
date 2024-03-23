const express = require("express");
const router = express.Router();
const {
  authorizedPermission,
  authenticateUser,
} = require("../middleware/authentication");

const {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/ProductController");
const { getSingleProductReview } = require("../controllers/ReviewController");

router
  .route("/")
  .get(getAllProducts)
  .post([authenticateUser, authorizedPermission("admin")], createProduct);
router
  .route("/uploadImage")
  .post(authenticateUser, authorizedPermission("admin"), uploadImage);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(authenticateUser, authorizedPermission("admin"), updateProduct)
  .delete([authenticateUser, authorizedPermission("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReview);

module.exports = router;
