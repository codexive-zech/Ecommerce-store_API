require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectBD = require("./db/connect");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const app = express();
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const authRouter = require("./routes/AuthRoutes");
const userRouter = require("./routes/UserRoutes");
const productRouter = require("./routes/ProductRoutes");
const reviewRouter = require("./routes/ReviewRoutes");
const orderRouter = require("./routes/OrderRoutes");

const notFoundErrorMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(xss());
app.use(mongoSanitize());
app.use(helmet());
app.use(cors());
app.use(express.json()); // having access to parse json data in req-body
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundErrorMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectBD(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log("E-Commerce New API");
    });
  } catch (error) {
    console.log(error);
  }
};
start();
