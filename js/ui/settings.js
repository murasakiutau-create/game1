// Persistent player settings (BGM track/volume + SE toggle).
// Direct object mutation; call saveSettings() to persist.

const KEY = "rensoudo:settings:v1";

const DEFAULTS = {
  bgmTrack: "A",      // "A" | "B"
  bgmVolume: 0.5,     // 0–1
  bgmEnabled: true,
  seEnabled: true,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export const SETTINGS = load();

export function saveSettings() {
  try { localStorage.setItem(KEY, JSON.stringify(SETTINGS)); } catch {}
}
