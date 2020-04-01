require("dotenv").config();
const port = process.env.PORT || 80;

var appPromise = require("./app").appPromise;

appPromise.then(function(app) {
  app.listen(port, () => {
    console.log(`listening on port ${port}.`);
  });
});
