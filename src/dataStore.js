const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();

exports.insertForm = async (submission, hashedUserID) => {
  const key = datastore.key({
    path: [process.env.NEW_DATASTORE_KIND, hashedUserID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  try {
    // Try to insert an object with hashed userId as key. If already submitted, fails
    const entity = {
      key,
      data: { ...submission, history: [submission.form_responses] }
    };
    await datastore.insert(entity);
  } catch (e) {
    // If it already exists, update with new history
    let [data] = await datastore.get(key);

    data.history.push(submission.form_responses);
    data.form_responses = submission.form_responses;
    data.timestamp = submission.timestamp;
    data.at_risk = submission.at_risk;
    data.probable = submission.probable;

    const entity = {
      key,
      data
    };
    const response = await datastore.update(entity);
  }
};

//Migrates form submitted with cookie as a key to use google userID as a key
exports.migrateCookieForm = async (hashedUserID, cookie_id) => {
  //userID is the hashed userID
  const cookieKey = datastore.key({
    path: [process.env.DATASTORE_KIND, cookie_id],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  const userIDKey = datastore.key({
    path: [process.env.NEW_DATASTORE_KIND, hashedUserID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  //cookieKey Data
  const [cookieKeyData] = await datastore.get(cookieKey);
  if (!cookieKeyData) {
    // No cookieKey form exists;
    return;
  }
  delete cookieKeyData.cookie_id; //Deletes old cookie_id field, no longer needed as express-session cookies are used
  try {
    // Try to insert an object with userId as key. If already submitted, fails
    const newEntity = {
      key: userIDKey,
      data: cookieKeyData
    };
    await datastore.insert(newEntity);
    console.log("Cookie entry migrated");
  } catch (e) {
    // If it already exists, add cookie to the cookies array
    let [userIDKeyData] = await datastore.get(userIDKey);
    delete userIDKeyData.cookie_id;

    //Concat history to the existing one
    userIDKeyData.history = userIDKeyData.history.concat(cookieKeyData.history);
    const updatedEntity = {
      key: userIDKey,
      data: userIDKeyData
    };
    const response = await datastore.update(updatedEntity);
    console.log("UserID entry Updated");
  }
  // Delete old cookieID entry
  await datastore.delete(cookieKey);
};
