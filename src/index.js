const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");
const requestIp = require("request-ip");
//const MongoClient = require("mongodb").MongoClient;
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const flattenMatrix = require("./flattenMatrix/matrix.js");


// Basic datastore insert and query examples from the docs.
// For more, see https://cloud.google.com/appengine/docs/standard/nodejs/using-cloud-datastore
const insertTestForms = testForms => {
  return datastore.save({
    key: datastore.key('test-forms'),
    data: testForms,
  });
};
const getTestForms = () => {
  const query = datastore
      .createQuery('test-forms')
      .order('timestamp', {descending: true})
      .limit(10);

  return datastore.runQuery(query);
};

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());

// submit endpoint
app.post("/submit", (req, res) => {
  const threatScore = flattenMatrix.getScoreFromAnswers(req.body);

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

// uid generator
app.use(cookieParser(uuidv4()));

// creates a cookie and saves IP address into DB
app.get("/", (req, res) => {
  // get client ip address
  let clientIp = {
    clientIp: requestIp.getClientIp(req)
  };

  console.log(clientIp["clientIp"]);

  // set signed cookie configurations
  const options = {
    httpOnly: true,
    signed: true
  };

  res.cookie("userCookieValue", uuidv4(), options);

  const form = {
    ip_addr: clientIp["clientIp"]
  };
  insertTestForms(form).catch(function(error) {console.log(error)});

  res.send("success");
});

// determines if a cookie already exists
app.get("/read-cookie", (req, res) => {
  let exists;
  req.signedCookies.userCookieValue ? (exists = true) : (exists = false);
  res.send({ exists: exists });
});

//clears cookie
app.get("/clear-cookie", (req, res) => {
  res.clearCookie("userCookieValue").send("success");
});

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
