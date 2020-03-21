const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();

exports.insertForm = async submission => {
  const key = datastore.key(
      {"path": [process.env.DATASTORE_KIND, submission.cookie_id],
        "namespace": process.env.DATASTORE_NAMESPACE});

  try {
    // Try to insert an object with cookie_id as key. If already submitted, fails
    const entity = {
      key,
      data: { ...submission, history: [] }
    };
    await datastore.insert(entity);
  } catch (e) {
    // If it already exists, update with new history
    let [data] = await datastore.get(key);

    data.history.push(data.form_responses);
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
