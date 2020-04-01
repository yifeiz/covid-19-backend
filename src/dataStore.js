const { Datastore } = require("@google-cloud/datastore");
const crypto = require("crypto");
const moment = require("moment");
const kms = require("./kms.js");

const datastore = new Datastore();

// max number of chars allowed in a google cloud datastore key - hashed IDs are longer
const encrypt_ip_substring_chars = 63;

// truncates IDs from the datastore into keys that can be used to encrypt parts of each document
function keyFromId(id) {
  return id.substring(0, encrypt_ip_substring_chars);
}

// Encrypts the Ip address in data, storing the cypher text in a different field
async function encryptIp(data) {
  data.ip_encrypted = await kms.encrypt(
    process.env.SECRETS_KEYRING,
    process.env.IP_KEY,
    data.ip_address
  );
  delete data.ip_address; // deletes the existing plaintext ip address, if it exists
}

exports.insertForm = async (submission, hashedUserID) => {
  //Cookie Form handling
  if (!hashedUserID) {
    //User is not logged in, use cookie as before to store/update form
    console.log("no login");
    const key = datastore.key({
      path: [process.env.DATASTORE_KIND, submission.cookie_id],
      namespace: process.env.DATASTORE_NAMESPACE
    });
    console.log(`key: ${key}`);

    try {
      console.log("Entering try");
      let data = { ...submission, history: [submission.form_responses] };
      // encrypt the ip of the submission using the cookie as the key
      await encryptIp(data);
      // Try to insert an object with cookie_id as key. If already submitted, fails
      const entity = {
        key,
        data: data
      };
      await datastore.insert(entity);
    } catch (e) {
      console.log("catch error");
      // If it already exists, update with new history
      let [data] = await datastore.get(key);

      data.history.push(submission.form_responses);
      data.form_responses = submission.form_responses;
      data.timestamp = submission.timestamp;
      data.at_risk = submission.at_risk;
      data.probable = submission.probable;
      // encrypt the ip of the submission using the cookie as the key, however this time we know that
      // the key already exists
      data.ip_address = submission.ip_address;
      await encryptIp(data);

      const entity = {
        key,
        data
      };
      const response = await datastore.update(entity);
    }
    return;
  }
  //End Cookie Form handling

  //Otherwise is logged in so proceed using the hashedUserID
  const key = datastore.key({
    path: [process.env.DATASTORE_KIND, hashedUserID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  try {
    // Try to insert an object with hashed userId as key. If already submitted, fails
    let data = { ...submission, history: [submission.form_responses] };
    await encryptIp(data);
    const entity = {
      key,
      data: data
    };
    await datastore.insert(entity);
    console.log("Form submitted");
  } catch (e) {
    // If it already exists, update with new history
    let [data] = await datastore.get(key);

    data.history.push(submission.form_responses);
    data.form_responses = submission.form_responses;
    data.timestamp = submission.timestamp;
    data.at_risk = submission.at_risk;
    data.probable = submission.probable;
    data.ip_address = submission.ip_address;
    await encryptIp(data);

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
    path: [process.env.DATASTORE_KIND, hashedUserID],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  //cookieKey Data
  const [cookieKeyData] = await datastore.get(cookieKey);
  if (!cookieKeyData) {
    // No cookieKey form exists;
    return;
  }

  // encrypt the IP in the cookie key data
  if (cookieKeyData.ip_encrypted === undefined) {
    // hash the ip with the new id
    await encryptIp(cookieKeyData);
  }

  delete cookieKeyData.cookie_id; //Deletes old cookie_id field, no longer needed as express-session cookies are used
  try {
    // Try to insert an object with userId as key. If already submitted, fails
    const newEntity = {
      key: userIDKey,
      data: cookieKeyData
    };
    await datastore.insert(newEntity);
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

exports.insertMarketingData = async email => {
  const key = datastore.key({
    path: [process.env.DATASTORE_KIND_MARKETING, email],
    namespace: process.env.DATASTORE_NAMESPACE
  });

  var timestamp = moment
    .utc()
    .startOf("day")
    .unix();

  try {
    // Try to insert an object with hashed email as key. If already submitted, fails
    const entity = {
      key,
      data: {
        email: email,
        timestamp: timestamp,
        timestamp_history: [timestamp]
      }
    };
    await datastore.insert(entity);
  } catch (e) {
    // If it already exists, update with new history
    let [data] = await datastore.get(key);

    data.timestamp = timestamp;
    data.timestamp_history.push(timestamp);

    const entity = {
      key,
      data
    };
    const response = await datastore.update(entity);
    console.log(response);
  }
};
