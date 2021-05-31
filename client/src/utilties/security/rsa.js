export async function rsaEncrypt(key, data)  {
  const ab2str = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  const enc = new TextEncoder();

  const encodedData = enc.encode(data);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    key,
    encodedData,
  );

  return `-----BEGIN RSA MESSAGE-----\n${window.btoa(ab2str(encrypted))}\n-----END RSA MESSAGE-----`;
}

export async function rsaDecrypt(key, ciphertext) {
  const dec = new TextDecoder();

  const str2ab = (str) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  const buffer = str2ab(window.atob(ciphertext.split('\n')[1]));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    key,
    buffer,
  )

  return dec.decode(decrypted);
}
