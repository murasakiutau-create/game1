// Looping background music with two switchable tracks and crossfade.
// Settings live in settings.js; this module reflects them onto <audio>.

import { SETTINGS } from "./settings.js";

export const TRACKS = {
  A: { src: "assets/bgm/bgmA-velvet-evidence.mp3", label: "A：Velvet Evidence" },
  B: { src: "assets/bgm/bgmB-cobalt-ledger.mp3",   label: "B：Cobalt Ledger" },
};

const FADE_MS = 5000;

const audios = {};
let activeId = null;     // track currently playing or fading out
let lastEnabled = false; // last reflected enabled state

const fadeRafs = new WeakMap(); // audio -> raf id

function ensure(id) {
  if (audios[id]) return audios[id];
  const a = new Audio(TRACKS[id].src);
  a.loop = true;
  a.preload = "auto";
  a.volume = 0;
  audios[id] = a;
  return a;
}

function tryPlay(audio) {
  const p = audio.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

function cancelFade(audio) {
  const id = fadeRafs.get(audio);
  if (id != null) cancelAnimationFrame(id);
  fadeRafs.delete(audio);
}

// Animate audio.volume toward `getTarget()` over `ms`. Reading the target
// each frame lets the live volume slider influence an in-flight fade.
function startFade(audio, getTarget, ms, onDone) {
  cancelFade(audio);
  const startVol = audio.volume;
  const startTime = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - startTime) / ms);
    const target = clamp01(getTarget());
    audio.volume = clamp01(startVol + (target - startVol) * t);
    if (t < 1) {
      fadeRafs.set(audio, requestAnimationFrame(step));
    } else {
      audio.volume = target;
      fadeRafs.delete(audio);
      if (onDone) onDone();
    }
  };
  fadeRafs.set(audio, requestAnimationFrame(step));
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export function applyBgm() {
  const wantTrack = TRACKS[SETTINGS.bgmTrack] ? SETTINGS.bgmTrack : "A";
  const wantEnabled = SETTINGS.bgmEnabled;

  // BGM disabled → fade out current track if any.
  if (!wantEnabled) {
    if (lastEnabled && activeId && audios[activeId]) {
      const a = audios[activeId];
      startFade(a, () => 0, FADE_MS, () => { try { a.pause(); } catch {} });
    }
    lastEnabled = false;
    activeId = wantTrack; // remember preference for next enable
    return;
  }

  // BGM enabled but nothing was active before → fade in want track.
  if (!lastEnabled) {
    const a = ensure(wantTrack);
    a.volume = 0;
    tryPlay(a);
    startFade(a, () => SETTINGS.bgmVolume, FADE_MS);
    activeId = wantTrack;
    lastEnabled = true;
    return;
  }

  // Track switched → crossfade old out, new in.
  if (activeId !== wantTrack) {
    const oldA = activeId ? audios[activeId] : null;
    if (oldA) {
      startFade(oldA, () => 0, FADE_MS, () => {
        try { oldA.pause(); oldA.currentTime = 0; } catch {}
      });
    }
    const newA = ensure(wantTrack);
    newA.volume = 0;
    tryPlay(newA);
    startFade(newA, () => SETTINGS.bgmVolume, FADE_MS);
    activeId = wantTrack;
    return;
  }

  // Same track, still enabled → volume-only change.
  const a = audios[activeId];
  if (a) {
    tryPlay(a); // no-op if already playing; recovers from blocked autoplay
    if (!fadeRafs.has(a)) a.volume = SETTINGS.bgmVolume;
    // If a fade is running, it reads SETTINGS.bgmVolume each frame.
  }
}

export function initBgm() {
  applyBgm();
  // Browsers usually block autoplay until first user gesture.
  // Retry on the very first interaction.
  const onGesture = () => {
    applyBgm();
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
  };
  window.addEventListener("pointerdown", onGesture, { once: true });
  window.addEventListener("keydown", onGesture, { once: true });
}
