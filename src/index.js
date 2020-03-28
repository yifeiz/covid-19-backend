require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const axios = require("axios");
const helmet = require("helmet");
const flattenMatrix = require("./flattenMatrix/matrix.js");
const googleData = require("./dataStore");

const port = process.env.PORT || 80;
const app = express();

app.use(cors({ origin: `https://${process.env.DOMAIN}`, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());

app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());

// Setting a uuid here instead of calling uuidv4() function, so that decoding value doesn't change everytime app restarts
app.use(cookieParser("a2285a99-34f3-459d-9ea7-f5171eed3aba"));

// submit endpoint
app.post("/submit", async (req, res) => {
  const SECRET_KEY = "6LfuVOIUAAAAAFWii1XMYDcGVjeXUrahVaHMxz26";

  /*const recaptchaResponse = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body.reactVerification}`
  );

  if (!recaptchaResponse.data.success) {
    res.status(400).send("error, invalid recaptcha");
    return;
  }
  */

  const form_response_fields = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'postalCode'];
  const form_responses = form_response_fields.reduce((obj, field) => ({ 
    ...obj, 
    [field]: req.body[field]
  }), {});

  const timestamp = Date.now()
  const submission = {
    timestamp,
    ip_address: requestIp.getClientIp(req),
    at_risk: flattenMatrix.atRisk(req.body),
    probable: flattenMatrix.probable(req.body),
    form_responses: {
      ...form_responses,
      timestamp
    }
  };

  // Check if cookie value already exists; if not, generate a new one
  if (req.signedCookies.userCookieValue) {
    submission.cookie_id = req.signedCookies.userCookieValue;
  } else {
    submission.cookie_id = uuidv4();
    const submission_cookie_options = {
      domain: process.env.DOMAIN,
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
      secure: true,
      signed: true,
    };
    res.cookie("userCookieValue", submission.cookie_id, submission_cookie_options);
  }

  // inserts/updates entity in dataStore
  console.log(submission);
  // await googleData.insertForm(submission);
  const data = { submitSuccess: true };
  res.status(200).json(data);
});

// determines if a cookie already exists
app.get("/read-cookie", (req, res) => {
  console.log(req.signedCookies.userCookieValue);
  const exists = req.signedCookies.userCookieValue ? true : false;
  res.send({ exists });
});

// clears cookie
app.delete("/clear-cookie", (req, res) => {
  res.clearCookie("userCookieValue").send("success");
});

app.get("/", (req, res) => {
  res.status(200).send(`COVID-19 ${process.env.BACKEND_BRANCH} BACKEND ONLINE`);
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
