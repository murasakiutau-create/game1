// Tiny SFX layer. Buttons opt in via the `btn` helper.

import { SETTINGS } from "./settings.js";

const SRC_PRIMARY = "assets/sfx/primary-button.mp3";
const SRC_GHOST = "assets/sfx/ghost-button.mp3";
const SRC_PLAIN = "assets/sfx/plain-button.mp3";
const VOLUME_PRIMARY = 0.7;
const VOLUME_GHOST = 0.6;
const VOLUME_PLAIN = 0.6;

const templates = {};

function ensureTemplate(src) {
  if (templates[src]) return templates[src];
  const a = new Audio(src);
  a.preload = "auto";
  templates[src] = a;
  return a;
}

function playClone(src, volume) {
  if (!SETTINGS.seEnabled) return;
  try {
    const tmpl = ensureTemplate(src);
    const a = tmpl.cloneNode();
    a.volume = volume;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // Audio is non-essential; ignore.
  }
}

export function playPrimaryClick() {
  playClone(SRC_PRIMARY, VOLUME_PRIMARY);
}

export function playGhostClick() {
  playClone(SRC_GHOST, VOLUME_GHOST);
}

export function playPlainClick() {
  playClone(SRC_PLAIN, VOLUME_PLAIN);
}

