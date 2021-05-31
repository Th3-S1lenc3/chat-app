export async function importKey(type, pem) {
  const supportedTypes = ['private', 'public'];

  if (!supportedTypes.includes(type)) {
    throw 'Invalid Type';
  }

  const str2ab = (str) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  const format = type === 'private' ? "pkcs8": "spki";
  const usage = type === 'private' ? "decrypt" : "encrypt";

  const pemHeader = `-----BEGIN ${type.toUpperCase()} KEY-----`;
  const pemFooter = `-----END ${type.toUpperCase()} KEY-----`;
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  const key = await window.crypto.subtle.importKey(
    format,
    binaryDer,
    {
        name: "RSA-OAEP",
        hash: "SHA-256",
    },
    true,
    [usage]
  );

  return key;
}

export async function importAESKey(key) {
  const imported = await window.crypto.subtle.importKey(
    "jwk",
    key,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  return imported;
}
