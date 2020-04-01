require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const app = express();

const routes = require("./routes");
const utils = require("./utils");

var cookieSecret;

loadCookieSecret = async () => {
  cookieSecret = await utils
    .accessSecretVersion(process.env.COOKIE_SECRET)
    .catch(console.error);
};

exports.appPromise = loadCookieSecret().then(() => {
  // ONLY FOR DEBUG, UNCOMMENT WHEN MERGED
  // app.use(cors({ origin: true, credentials: true }));
  app.use(cors({ origin: `https://${process.env.DOMAIN}`, credentials: true }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.raw());
  app.use(express.json());
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(cookieParser(cookieSecret));
  app.use("/", routes);

  console.log(cookieSecret);
  return app;
});
