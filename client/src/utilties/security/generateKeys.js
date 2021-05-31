export async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: {name: "SHA-256"},
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

export async function generateAESKey() {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  return key;
}
