
async function createCryptoKey(
    cryptoKeyId // Name of the crypto key
) {
    // The GCP project ID.
    const projectId = process.env.PROJECT_ID;
    // The ID of the keyring that the key is to be stored on.
    const keyRingId = process.env.KEYRING_ID;
    // The location of the crypto key's key ring, e.g. "global"
    const locationId = process.env.KEYRING_LOCATION;

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    const parent = client.keyRingPath(projectId, locationId, keyRingId);

    // Creates a new key ring
    const [cryptoKey] = await client.createCryptoKey({
        parent,
        cryptoKeyId,
        cryptoKey: {
            // This will allow the API access to the key for encryption and decryption
            purpose: 'ENCRYPT_DECRYPT',
        },
    });
}

async function encrypt(
    cryptoKeyId, // Name of the crypto key, e.g. "my-key"
    plaintext // Plaintext to be encrypted
) {
    // The GCP project ID.
    const projectId = process.env.PROJECT_ID;
    // The ID of the keyring that the key is to be stored on.
    const keyRingId = process.env.KEYRING_ID;
    // The location of the crypto key's key ring, e.g. "global"
    const locationId = process.env.KEYRING_LOCATION;

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    const name = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );

    var buf = Buffer.from(plaintext);

    // Encrypts the file using the specified crypto key
    const [result] = await client.encrypt({name: name, plaintext: buf});
    return result.ciphertext.toString("base64");
}


async function decrypt(
    cryptoKeyId, // Name of the crypto key, e.g. "my-key"
    ciphertext // Data to be decrypted
) {
    // The GCP project ID.
    const projectId = process.env.PROJECT_ID;
    // The ID of the keyring that the key is to be stored on.
    const keyRingId = process.env.KEYRING_ID;
    // The location of the crypto key's key ring, e.g. "global"
    const locationId = process.env.KEYRING_LOCATION;

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    const name = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );

    var buf = Buffer.from(ciphertext, "base64");

    // Decrypts the file using the specified crypto key
    // const [result] = await client.decrypt({name, buf});
    const [result] = await client.decrypt({name: name, ciphertext: buf});

    return result.plaintext.toString('utf8');
}
