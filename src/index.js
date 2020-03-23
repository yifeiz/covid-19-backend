require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 80;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const axios = require("axios");
const flattenMatrix = require("./flattenMatrix/matrix.js");
const googleData = require("./dataStore");

app.use(cors({ origin: "https://flatten.ca", credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());

// Setting a uuid here instead of calling uuidv4() function, so that decoding value doesn't change everytime app restarts
app.use(cookieParser("a2285a99-34f3-459d-9ea7-f5171eed3aba"));

app.use((req, res, next) => {
  if (
    req.url[0] !== "/" ||
    req.originalUrl[0] !== "/" ||
    !req.hostname.includes("flatten.ca")
  ) {
    res.status(404).send("Error");
  } else {
    next();
  }
});

// submit endpoint
app.post("/submit", async (req, res) => {
  // const threatScore = flattenMatrix.getScoreFromAnswers(req.body);

  console.log(req.body);

  const SECRET_KEY = "6LfuVOIUAAAAAFWii1XMYDcGVjeXUrahVaHMxz26";

  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body.reactVerification}`
  );

  console.log(response);

  if (!response.data.success) {
    res.status(400).send("error, invalid recaptcha");
    return;
  }

  let submission = {};
  submission.timestamp = Date.now();
  submission.ip_address = requestIp.getClientIp(req);

  // Check if cookie value already exists; if not, generate a new one
  if (req.signedCookies.userCookieValue) {
    submission.cookie_id = req.signedCookies.userCookieValue;
  } else {
    submission.cookie_id = uuidv4();
    const cookie_options = {
      httpOnly: true,
      signed: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 2 //maxAge is ms thus this is 2 years
    };

    res.cookie("userCookieValue", submission.cookie_id, cookie_options);
  }

  submission.at_risk = flattenMatrix.atRisk(req.body);
  submission.probable = flattenMatrix.probable(req.body);
  submission.form_responses = { ...req.body, timestamp: submission.timestamp };

  // inserts/updates entity in dataStore
  await googleData.insertForm(submission);
  res.status(200).send("submissions recorded");

  // if (threatScore) {
  //   const matrixResponse = flattenMatrix.getResponseFromScore(threatScore);

  //   const responseJson = {
  //     score: threatScore,
  //     response: matrixResponse
  //   };
  //   res.status(200).json(responseJson);
  // } else {
  //   throw new Error("Invalid Response");
  // }
});

// determines if a cookie already exists
app.get("/read-cookie", (req, res) => {
  let exists;
  console.log(req.signedCookies.userCookieValue);
  exists = req.signedCookies.userCookieValue ? true : false;
  res.send({ exists });
});

//clears cookie
app.delete("/clear-cookie", (req, res) => {
  res.clearCookie("userCookieValue").send("success");
});

app.get("/", (req, res) => {
  res.status(200).send(`COVID-19 ${process.env.BACKEND_BRANCH} BACKEND ONLINE`);
});

// submit endpoint

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
