require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const api = require("./api");

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.json());
// Routers
app.use("/api", api);
// Setting a uuid here instead of calling uuidv4() function, so that decoding value doesn't change everytime app restarts
app.use(cookieParser("a2285a99-34f3-459d-9ea7-f5171eed3aba"));

const port = process.env.PORT || 80;

// submit endpoint

app.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
