const express = require("express");
const {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/ReviewController");
const { authenticateUser } = require("../middleware/authentication");
const router = express.Router();

router.route("/").post(authenticateUser, createReview).get(getAllReview);
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

module.exports = router;
