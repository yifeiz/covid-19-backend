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
    console.log(`Key ${cryptoKey.name} created.`);
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

    var buf = Buffer.from(plaintext, "base64");
    console.log(buf);

    // Encrypts the file using the specified crypto key
    const [result] = await client.encrypt({name: name, plaintext: buf});
    console.log(result);
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

    console.log(name);
    console.log(buf);
    // Decrypts the file using the specified crypto key
    // const [result] = await client.decrypt({name, buf});
    const [result] = await client.decrypt({name: name, ciphertext: buf});

    console.log(result);
    return result.plaintext.toString('base64');
}

async function testKR() {
    const key = 'b3';
    const data = 'hello world hello';

    // await createCryptoKey(key);
    var ciphertext = await encrypt(key, data).catch(console.error);
    console.log(`Encrypted ${ciphertext}`);
    var decyphered = await decrypt(key, ciphertext).catch(console.error);
    console.log(`Decrypted ${decyphered}`);
}

testKR();
