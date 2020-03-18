const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");
const MongoClient = require("mongodb").MongoClient;

require("dotenv").config();

const cloud = false;

const url = cloud
  ? `mongodb+srv://admin:${process.env.DBPASSWORD}@covid-19-09okh.mongodb.net/test?retryWrites=true&w=majority`
  : "mongodb://127.0.0.1:27017";

var db, collection, users;

const dbName = "covid-19";

MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) return console.log(err);

    db = client.db(dbName);

    console.log(`Connected MongoDB: ${url}`);
  }
);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());

app.use(cookieParser('82e4e438a0705fabf61f9854e3b575af'))

app.get("/", (req, res) => {
  // console.log("Cookies: ", req.cookies)
  // console.log("Signed Cookies: ", req.signedCookies)

  // const options = {
  //   httpOnly: true,
  //   signed: true,
  // };

  // res.cookie("name", "value", options);

  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    var dbo = db.db("users")
    var cookieInfo = req.cookies
    dbo.collection("patients").insertOne(cookieInfo, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  })

  res.status(200).send("success");
});

app.get("/clear-cookie", (req, res) => {
  res.send("In Progress")
});

app.listen(port, () => {
  console.log("listening on port " + port + ".");
});
