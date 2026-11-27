"use strict";
const context = new TextEncoder().encode("WedgeScope personal scanner v1");
const unpack = value => {
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
};
const pack = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function unlockRelease(invite, release) {
  const code = /^WS1\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{43})$/.exec(invite.trim());
  if (!code || release.format !== 1 || !Object.hasOwn(release.grants, code[1])) throw new Error("Invalid invite");
  const grant = release.grants[code[1]], point = unpack(grant.public);
  const privateKey = await crypto.subtle.importKey("jwk", {
    kty: "EC", crv: "P-256", x: pack(point.slice(1, 33)), y: pack(point.slice(33)), d: code[2]
  }, {name: "ECDH", namedCurve: "P-256"}, false, ["deriveBits"]);
  const sender = await crypto.subtle.importKey("raw", unpack(release.sender),
    {name: "ECDH", namedCurve: "P-256"}, false, []);
  const shared = await crypto.subtle.deriveBits({name: "ECDH", public: sender}, privateKey, 256);
  const material = await crypto.subtle.importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  const wrapping = await crypto.subtle.deriveKey({name: "HKDF", hash: "SHA-256", salt: unpack(release.salt), info: context},
    material, {name: "AES-KW", length: 256}, false, ["unwrapKey"]);
  const content = await crypto.subtle.unwrapKey("raw", unpack(grant.wrapped), wrapping, "AES-KW",
    {name: "AES-GCM", length: 256}, false, ["decrypt"]);
  return crypto.subtle.decrypt({name: "AES-GCM", iv: unpack(release.nonce), additionalData: context}, content, unpack(release.archive));
}
