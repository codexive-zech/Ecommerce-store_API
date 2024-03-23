const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      require: [true, "Please Provide Review Rating"],
    },
    title: {
      type: String,
      trim: true,
      require: [true, "Please Provide Review Title"],
      maxlength: 50,
    },
    comment: {
      type: String,
      require: [true, "Please Provide Review Comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamp: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // only 1 user can leave a review on 1 product

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
