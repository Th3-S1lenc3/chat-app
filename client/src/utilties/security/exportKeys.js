export async function exportKey(type, key) {
  const supportedTypes = ['private', 'public'];

  if (!supportedTypes.includes(type)) {
    throw 'Invalid Type';
  }

  const ab2str = (buf) => {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  const format = type === 'private' ? "pkcs8": "spki";

  const exported = await window.crypto.subtle.exportKey(
    format,
    key
  );

  const exportedAsString = ab2str(exported);
  const exportedAsBase64 = window.btoa(exportedAsString);
  const pemExported = `-----BEGIN ${type.toUpperCase()} KEY-----\n${exportedAsBase64}\n-----END ${type.toUpperCase()} KEY-----`;

  return pemExported;
}

export async function exportAESKey(key) {
  const exported = await window.crypto.subtle.exportKey(
    "jwk",
    key,
  );
  return JSON.stringify(exported, null, " ");
}
