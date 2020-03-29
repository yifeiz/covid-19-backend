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
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const hashingIterations = 100000;
const CLIENT_ID = process.env.CLIENT_ID;

// ONLY FOR DEBUG, UNCOMMENT WHEN MERGED
// app.use(cors({ origin: `https://${process.env.DOMAIN}`, credentials: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());

// Setting a uuid here instead of calling uuidv4() function, so that decoding value doesn't change everytime app restarts
app.use(cookieParser("a2285a99-34f3-459d-9ea7-f5171eed3aba"));

// submit endpoint
app.post("/submit", async (req, res) => {
  let submission = {};

  // //Google Sign-In Token Verification
  // //Add google token field to req body
  // const client = new OAuth2Client(CLIENT_ID);
  // console.log(`Google IDToken: ${req.body.token}`);
  // async function verify() {
  //   const ticket = await client.verifyIdToken({
  //     idToken: token,
  //     audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
  //     // Or, if multiple clients access the backend:
  //     //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  //   });
  //   const payload = ticket.getPayload();
  //   const userID = payload["sub"]; //sub is the user's unique google ID
  //   crypto.pbkdf2(
  //     userID, //Thing to hash
  //     process.env.PEPPER, //128bit Pepper
  //     hashingIterations, //Num of iterations (recomended is aprox 100k)
  //     64, //Key length
  //     "sha512", // HMAC Digest Algorithm
  //     async (err, derivedKey) => {
  //       if (err) {
  //         res.status(400).send(`Hashing error: ${err}`);
  //       }
  //       submission.hashedUserID = derivedKey;
  //     }
  //   );
  // }
  // verify().catch(console.error);
  // //End Token Verification

  // const threatScore = flattenMatrix.getScoreFromAnswers(req.body);

  // console.log(req.body);

  const SECRET_KEY = "6LfuVOIUAAAAAFWii1XMYDcGVjeXUrahVaHMxz26";

  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${req.body.reactVerification}`
  );

  // console.log(response);

  if (!response.data.success) {
    res.status(400).send("error, invalid recaptcha");
    return;
  }

  submission.timestamp = Date.now();
  submission.ip_address = requestIp.getClientIp(req);
  submission.at_risk = flattenMatrix.atRisk(req.body);
  submission.probable = flattenMatrix.probable(req.body);
  submission.form_responses = { ...req.body, timestamp: submission.timestamp };

  // inserts/updates entity in dataStore
  const userID = "2";
  crypto.pbkdf2(
    userID, //Thing to hash
    process.env.PEPPER, //128bit Pepper
    hashingIterations, //Num of iterations (recomended is aprox 100k)
    64, //Key length
    "sha512", // HMAC Digest Algorithm
    async (err, derivedKey) => {
      if (err) {
        res.status(400).send(`Hashing error: ${err}`);
      }
      submission.hashedUserID = derivedKey.toString("hex");
      await googleData.insertForm(submission);
      console.log("Done submit");
      const data = { submitSuccess: true };
      res.status(200).json(data);
    }
  );
});

app.post("/login", async (req, res) => {
  // //Include google token field and cookies to req body
  // //Google Sign-In Token Verification
  // const client = new OAuth2Client(CLIENT_ID);
  // let userID = null;
  // console.log(`Google IDToken: ${req.body.token}`);
  // async function verify() {
  //   const ticket = await client.verifyIdToken({
  //     idToken: token,
  //     audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
  //     // Or, if multiple clients access the backend:
  //     //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  //   });
  //   const payload = ticket.getPayload();
  //   userID = payload["sub"]; //sub is the user's unique google ID
  // }
  // verify().catch(() => {
  //   res.status(400).send("Token not valid, login failed");
  //   return;
  // });
  // console.log(`Google UserID: ${userID}`);
  // //End Token Verification

  ////If cookie exists there may be a form associated w it
  // const cookie_id = req.signedCookies.userCookieValue;

  //Debug
  const cookie_id = "6bcd0fea-085c-4fc5-807a-50b727ac828e";
  const userID = cookie_id;

  //Need to associate it w the googleUserID instead and delete the old one
  if (cookie_id) {
    crypto.pbkdf2(
      userID, // Thing to hash
      process.env.PEPPER, // 128bit Pepper
      hashingIterations, // Num of iterations (recomended is aprox 100k)
      64, // Key length
      "sha512", // HMAC Digest Algorithm
      async (err, derivedKey) => {
        if (err) {
          res.status(400).send(`Hashing error: ${err}`);
        }
        console.log(derivedKey.toString("hex"));
        await googleData.migrateCookieForm(
          derivedKey.toString("hex"),
          cookie_id
        );
      }
    );
  }
  const data = { loginSuccess: true };
  res.status(200).json(data);
});

// determines if a cookie already exists
app.get("/read-cookie", (req, res) => {
  let exists;
  console.log(req.signedCookies.userCookieValue);
  exists = req.signedCookies.userCookieValue ? true : false;
  res.send({ exists });
});

// clears cookie
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
