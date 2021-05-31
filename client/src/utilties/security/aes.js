export async function aesEncrypt(key, data) {
  const ab2str = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  const enc = new TextEncoder();

  const encodedData = enc.encode(data);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedData,
  );

  return {
    encrypted: window.btoa(ab2str(encrypted)),
    iv: window.btoa(ab2str(iv))
  }
}

export async function aesDecrypt(key, ciphertext, iv) {
  const dec = new TextDecoder();

  const str2ab = (str) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  const buffer = str2ab(window.atob(ciphertext));

  const ivBuffer = str2ab(window.atob(iv));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    buffer,
  );

  return dec.decode(decrypted);
}
