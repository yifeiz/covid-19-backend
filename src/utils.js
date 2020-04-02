const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const smClient = new SecretManagerServiceClient();

exports.accessSecretVersion = async name => {
  const [version] = await smClient.accessSecretVersion({
    name: name
  });

  const payload = version.payload.data.toString("utf8");

  return payload;
};
