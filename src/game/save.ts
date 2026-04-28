import type { PlayerState } from './state';

export const SAVE_VERSION = 1;
export const NUM_SLOTS = 3;
export type SlotIndex = 1 | 2 | 3;

export interface SaveSlot {
  version: number;
  payload: PlayerState;
  signature: string;            // HMAC-SHA256(canonical(payload) + version)
  savedAt: string;
  summary: SaveSummary;
}

export interface SaveSummary {
  floor: number;
  gold: number;
  hp: number;
  maxHp: number;
  recipesKnown: number;
  ownedSkills: number;
  bossDefeated: boolean;
  totalCrafts: number;
  totalKills: number;
}

const SLOT_KEY = (i: SlotIndex) => `game1:slot:${i}`;
const LAST_SLOT_KEY = 'game1:lastSlot';

// canonicalJSON: キーをソートして決定的な文字列に
function canonicalJSON(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJSON).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalJSON(obj[k])).join(',') +
    '}'
  );
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getSecretKey(): string {
  // ビルド時に vite.config.ts 経由で注入される。dev時はデフォルト値。
  // クライアントゲームなので「完全な防御」ではなく「カジュアルな改竄を弾く」目的。
  return typeof __SAVE_KEY__ !== 'undefined' ? __SAVE_KEY__ : 'game1-dev-fallback';
}

export function summarize(p: PlayerState): SaveSummary {
  // hpはeffectiveStatsを使うとcyclic depなので簡易計算
  let maxHp = p.baseMaxHp + p.permanentBonuses.maxHp;
  // 装備分を加算
  // 循環回避のため重複コードでなく簡易に
  for (const slot of ['weapon', 'armor', 'accessory'] as const) {
    const id = p.equippedGear[slot];
    if (!id) continue;
    // EQUIPMENTSをimportすると循環なし（saveはequipmentに依存しない方がいい）
    // ここでは baseMaxHp + permanent のみで近似
  }
  return {
    floor: p.currentFloor,
    gold: p.gold,
    hp: p.hp,
    maxHp,
    recipesKnown: p.knownRecipes.length,
    ownedSkills: p.ownedSkills.length,
    bossDefeated: p.bossDefeated,
    totalCrafts: p.totalCrafts,
    totalKills: p.totalKills,
  };
}

async function buildSlot(payload: PlayerState): Promise<SaveSlot> {
  const summary = summarize(payload);
  const canonical = canonicalJSON({ version: SAVE_VERSION, payload });
  const signature = await hmacSha256(canonical, getSecretKey());
  return {
    version: SAVE_VERSION,
    payload,
    signature,
    savedAt: new Date().toISOString(),
    summary,
  };
}

async function verifySlot(slot: SaveSlot): Promise<boolean> {
  if (typeof slot !== 'object' || slot === null) return false;
  if (slot.version !== SAVE_VERSION) return false;
  if (typeof slot.signature !== 'string' || typeof slot.payload !== 'object') return false;
  const canonical = canonicalJSON({ version: slot.version, payload: slot.payload });
  const expected = await hmacSha256(canonical, getSecretKey());
  return constantTimeEqual(expected, slot.signature);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}

export async function saveToSlot(slotIndex: SlotIndex, player: PlayerState): Promise<void> {
  const slot = await buildSlot(player);
  localStorage.setItem(SLOT_KEY(slotIndex), JSON.stringify(slot));
  localStorage.setItem(LAST_SLOT_KEY, String(slotIndex));
}

export async function loadFromSlot(slotIndex: SlotIndex): Promise<
  { ok: true; player: PlayerState; slot: SaveSlot } | { ok: false; reason: string }
> {
  const raw = localStorage.getItem(SLOT_KEY(slotIndex));
  if (!raw) return { ok: false, reason: 'スロットが空です' };
  let parsed: SaveSlot;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'セーブデータが破損しています' };
  }
  const ok = await verifySlot(parsed);
  if (!ok) return { ok: false, reason: '改竄／破損が検出されました' };
  return { ok: true, player: parsed.payload, slot: parsed };
}

export function readSlotMeta(slotIndex: SlotIndex): SaveSlot | null {
  const raw = localStorage.getItem(SLOT_KEY(slotIndex));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function deleteSlot(slotIndex: SlotIndex): void {
  localStorage.removeItem(SLOT_KEY(slotIndex));
}

export function getLastSlot(): SlotIndex | null {
  const v = localStorage.getItem(LAST_SLOT_KEY);
  if (!v) return null;
  const n = parseInt(v, 10);
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

// ── インポート／エクスポート ─────────────────────────

// Base64URLエンコード（パディング省略）
function base64Encode(s: string): string {
  // UTF-8 safe
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64Decode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function exportSlot(slotIndex: SlotIndex): Promise<string | null> {
  const raw = localStorage.getItem(SLOT_KEY(slotIndex));
  if (!raw) return null;
  // セーブはすでに署名付きなので、そのままbase64化
  return 'GAME1-' + base64Encode(raw);
}

export async function importString(
  text: string,
): Promise<
  | { ok: true; slot: SaveSlot }
  | { ok: false; reason: string }
> {
  const trimmed = text.trim();
  if (!trimmed.startsWith('GAME1-')) {
    return { ok: false, reason: '形式が違います（先頭が GAME1- で始まる必要があります）' };
  }
  const body = trimmed.slice('GAME1-'.length);
  let json: string;
  try {
    json = base64Decode(body);
  } catch {
    return { ok: false, reason: 'デコード失敗' };
  }
  let parsed: SaveSlot;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'JSONとして解釈できません' };
  }
  const ok = await verifySlot(parsed);
  if (!ok) return { ok: false, reason: '改竄／破損が検出されました' };
  return { ok: true, slot: parsed };
}

export async function importToSlot(slotIndex: SlotIndex, text: string) {
  const r = await importString(text);
  if (!r.ok) return r;
  // 検証済みの slot をそのまま保存（再署名はしない＝署名はそのままなので localStorage直書き と同等）
  localStorage.setItem(SLOT_KEY(slotIndex), JSON.stringify(r.slot));
  localStorage.setItem(LAST_SLOT_KEY, String(slotIndex));
  return { ok: true as const, slot: r.slot };
}
