// Tiny SFX layer. Buttons opt in via the `btn` helper.

const SRC_PRIMARY = "assets/sfx/primary-button.mp3";
const VOLUME_PRIMARY = 0.7;

let primaryTemplate = null;

function ensurePrimary() {
  if (primaryTemplate) return primaryTemplate;
  primaryTemplate = new Audio(SRC_PRIMARY);
  primaryTemplate.preload = "auto";
  return primaryTemplate;
}

export function playPrimaryClick() {
  try {
    ensurePrimary();
    const a = primaryTemplate.cloneNode();
    a.volume = VOLUME_PRIMARY;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // Ignore — audio is non-essential.
  }
}
