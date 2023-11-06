
let clientID,
	userIdKey,
	default_url = "http://localhost:58972";

async function initializeSDK() {
  // Generate a key pair
  userIdKey = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true, // whether the key is extractable (i.e. can be used in exportKey)
    ["sign", "verify"] // can be used to sign or verify signatures
  );

  // Export the public key and generate a client ID
  clientID = await getClientId(PARAM_HERE); // TODO
  
  // Assuming we don't want to store the private key, it remains within the scope of the SDK
  return { base_url: default_url };
} 
  

function getClientId() {
  return clientID; //TODO: find how to get clientID
}

async function signForClient(obj) {
  // Stringify the object and encode it as a Uint8Array
  const data = new TextEncoder().encode(JSON.stringify(obj));
  
  // Sign the data
  const signature = await window.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    userIdKey.privateKey,
    data
  );
  
  // Convert the signature to Base64
  return window.btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
}

async function getClientPublicKey() {
  // Export the public key to PEM format
  const publicKey = await window.crypto.subtle.exportKey("spki", userIdKey.publicKey);
  return clean_pem_pub_key(publicKey);
}

// Clean the PEM formatted string
function clean_pem_pub_key(arrayBuffer) {
  const base64 = window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
  let pem = `-----BEGIN PUBLIC KEY-----\n`;
  let offset = 0;
  while (offset < base64.length) {
    pem += base64.substring(offset, offset + 64) + "\n";
    offset += 64;
  }
  pem += `-----END PUBLIC KEY-----`;
  return pem;
}

// Export the functions you want to expose
export {
  initializeSDK,
  getClientPublicKey,
  getClientId,
  signForClient,
};
