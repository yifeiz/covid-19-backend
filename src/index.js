const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");

const flattenMatrix = require("./flattenMatrix/matrix.js");
const googleData = require("./dataStore");

require("dotenv").config();
const port = process.env.PORT || 80;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());
// Setting a uuid here instead of calling uuidv4() function, so that decoding value doesn't change everytime app restarts
app.use(cookieParser("a2285a99-34f3-459d-9ea7-f5171eed3aba"));

// submit endpoint
app.post("/submit", async (req, res) => {
  const threatScore = flattenMatrix.getScoreFromAnswers(req.body);

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
      signed: true
    };

    res.cookie("userCookieValue", submission.cookie_id, cookie_options);
  }

  submission.at_risk = flattenMatrix.atRisk(req.body);
  submission.probable = flattenMatrix.probable(req.body);
  submission.form_responses = { ...req.body, timestamp: submission.timestamp };

  // inserts/updates entity in dataStore
  await googleData.insertForm(submission);

  if (threatScore) {
    const matrixResponse = flattenMatrix.getResponseFromScore(threatScore);

    const responseJson = {
      score: threatScore,
      response: matrixResponse
    };
    res.status(200).json(responseJson);
  } else {
    throw new Error("Invalid Response");
  }
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
  res.status(200).send("COVID-19 Backend Online");
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
