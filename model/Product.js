const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please Provide Product Name"],
      maxlength: [100, "Product Name can not exceed 100 character"],
    },
    price: {
      type: Number,
      required: [true, "Please Provide Product Price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please Provide Product Description"],
      maxlength: [1000, "Product Description can not exceed 1000 character"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please Provide Product Category"],
      enum: ["kitchen", "office", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please Provide Product Company"],
      enum: {
        values: ["ikea", "libby", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { victuals: true }, toObject: { victuals: true } }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

productSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
