// Looping background music with two switchable tracks.
// Settings live in settings.js; this module reflects them onto <audio>.

import { SETTINGS } from "./settings.js";

export const TRACKS = {
  A: { src: "assets/bgm/bgmA-velvet-evidence.mp3", label: "A：Velvet Evidence" },
  B: { src: "assets/bgm/bgmB-cobalt-ledger.mp3",   label: "B：Cobalt Ledger" },
};

const audios = {};
let currentId = null;

function ensure(id) {
  if (audios[id]) return audios[id];
  const a = new Audio(TRACKS[id].src);
  a.loop = true;
  a.preload = "auto";
  a.volume = SETTINGS.bgmVolume;
  audios[id] = a;
  return a;
}

function tryPlay(audio) {
  const p = audio.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

export function applyBgm() {
  const want = TRACKS[SETTINGS.bgmTrack] ? SETTINGS.bgmTrack : "A";
  if (currentId !== want) {
    if (currentId && audios[currentId]) {
      try { audios[currentId].pause(); audios[currentId].currentTime = 0; } catch {}
    }
    currentId = want;
  }
  const cur = ensure(currentId);
  cur.volume = SETTINGS.bgmVolume;
  if (SETTINGS.bgmEnabled) tryPlay(cur);
  else { try { cur.pause(); } catch {} }
}

let unlocked = false;
function unlockOnFirstGesture() {
  if (unlocked) return;
  unlocked = true;
  applyBgm();
}

export function initBgm() {
  applyBgm();
  // Browsers usually block autoplay until first user gesture.
  // Retry on the very first interaction.
  const onGesture = () => {
    unlockOnFirstGesture();
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
  };
  window.addEventListener("pointerdown", onGesture, { once: true });
  window.addEventListener("keydown", onGesture, { once: true });
}
