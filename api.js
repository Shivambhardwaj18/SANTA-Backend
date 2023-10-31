require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const configs = require("./common/common");

//Servers configuration

const app = express();

//To access the serve images from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

/**
 * imports for routes
 */
const userRoutes = require("./module/user/user_routes");
const dataRoutes = require("./module/data/data_routes");

const expressPort = process.env.EXPRESS_PORT || 8000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, PATCH, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    return res.status(200).json({});
  }
  next();
});

app.use("/user", userRoutes);
app.use("/data", dataRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello !! DB Connected!!!",
    url: `${req.protocol}://${req.get("host")}`,
  });
});
mongoose
  .connect(configs.mongoUrl.DEVELOPMENT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected!!!");

    app.listen(expressPort, () =>
      console.log(`Server running on port ${expressPort}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
