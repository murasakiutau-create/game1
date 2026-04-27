// Save / load via base64 + SHA-256 checksum. Format:
//   ALC1.<base64(JSON)>.<hex12(sha256(JSON + SECRET))>
// Tampering with body or hash both fail import.
// Note: SECRET is shipped client-side, so this is *deterrence* not security.

import { snapshot, loadFromObject, VERSION } from "./state.js";

const SECRET = "alc-grimoire-2026-月影と硝子の調合室";

// btoa with unicode safety
function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

async function sha256Hex(s) {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function exportSave() {
  const snap = snapshot();
  const json = JSON.stringify(snap);
  const body = utf8ToB64(json);
  const hashSrc = body + "|" + SECRET;
  const fullHash = await sha256Hex(hashSrc);
  const tag = fullHash.slice(0, 12);
  return `${VERSION}.${body}.${tag}`;
}

export async function importSave(text) {
  if (typeof text !== "string") throw new Error("記録の形式が違います。");
  const trimmed = text.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) throw new Error("記録の形式が違います。");
  const [ver, body, tag] = parts;
  if (ver !== VERSION) throw new Error("別バージョンの記録です。");
  const expected = (await sha256Hex(body + "|" + SECRET)).slice(0, 12);
  if (expected !== tag) throw new Error("改竄、または別バージョンの記録です。");
  let json;
  try {
    json = b64ToUtf8(body);
  } catch (_) {
    throw new Error("記録を復号できませんでした。");
  }
  let obj;
  try {
    obj = JSON.parse(json);
  } catch (_) {
    throw new Error("記録の中身が壊れています。");
  }
  loadFromObject(obj);
  return true;
}
