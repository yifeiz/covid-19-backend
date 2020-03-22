require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");

const flattenMatrix = require("./flattenMatrix/matrix.js");
const googleData = require("./dataStore");
var express = require("express");
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.post("/submit", async (req, res) => {
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
      signed: true,
      domain: ".flatten.ca",
      secure: true
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
router.get("/read-cookie", (req, res) => {
  let exists;
  console.log(req.signedCookies.userCookieValue);
  exists = req.signedCookies.userCookieValue ? true : false;
  res.send({ exists });
});

//clears cookie
router.delete("/clear-cookie", (req, res) => {
  res.clearCookie("userCookieValue").send("success");
});

router.get("/", (req, res) => {
  res.status(200).send(`COVID-19 ${process.env.BACKEND_BRANCH} Backend Online`);
});

module.exports = router;
