const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();

exports.insertForm = async submission => {
  const key = datastore.key({
    path: [process.env.NEW_DATASTORE_KIND, submission.userID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  try {
    // Try to insert an object with userId as key. If already submitted, fails
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
    console.log(response);
  }
};

//Migrates form submitted with cookie as a key to use google userID as a key
exports.migrateCookieForm = async (userID, cookie_id) => {
  //userID is the hashed userID
  const cookieKey = datastore.key({
    path: [process.env.DATASTORE_KIND, cookie_id],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  const key = datastore.key({
    path: [process.env.NEW_DATASTORE_KIND, userID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  //cookieKey Data
  const [data] = await datastore.get(cookieKey);
  if (!data) {
    // No cookieKey form exists;
    return;
  }

  data.cookie_id = [data.cookie_id]; // Array of all cookies associated w this google account

  try {
    // Try to insert an object with userId as key. If already submitted, fails
    const entity = {
      key,
      data
    };
    await datastore.insert(entity);
  } catch (e) {
    // If it already exists, add cookie to the cookies array
    let [data] = await datastore.get(key);

    data.cookie_id.push(cookie_id);

    const entity = {
      key,
      data
    };
    const response = await datastore.update(entity);
    console.log(response);
  }
  // Delete old cookieID entry
  await datastore.delete(cookieKey);
};
